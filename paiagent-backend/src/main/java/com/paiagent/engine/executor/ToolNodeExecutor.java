package com.paiagent.engine.executor;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.tts.TTSProvider;
import com.paiagent.engine.tts.TTSProviderFactory;
import com.paiagent.engine.tts.TTSRequest;
import com.paiagent.engine.tts.TTSResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class ToolNodeExecutor implements NodeExecutor {

    private final TTSProviderFactory ttsProviderFactory;

    public ToolNodeExecutor(TTSProviderFactory ttsProviderFactory) {
        this.ttsProviderFactory = ttsProviderFactory;
    }

    @Override
    public String getType() {
        return "TOOL";
    }

    @Override
    public Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context) {
        String toolType = (String) nodeData.getOrDefault("toolType", "voice_synthesis");

        return switch (toolType) {
            case "voice_synthesis" -> executeVoiceSynthesis(nodeId, nodeData, context);
            default -> throw new IllegalArgumentException("未知工具类型: " + toolType);
        };
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> executeVoiceSynthesis(String nodeId, Map<String, Object> nodeData,
                                                       ExecutionContext context) {
        // Read tool configuration
        Map<String, Object> toolConfig = (Map<String, Object>) nodeData.get("toolConfig");
        String apiKey = toolConfig != null ? (String) toolConfig.get("apiKey") : null;
        String modelName = toolConfig != null ? (String) toolConfig.get("modelName") : "qwen3-tts-flash";

        // Process input parameters: [{name: "text", parameterType: "reference", value: "..."}, ...]
        Map<String, String> inputParams = new HashMap<>();
        Object paramsObj = nodeData.get("inputParameters");
        if (paramsObj instanceof List<?> params) {
            for (Object item : params) {
                if (item instanceof Map<?, ?> param) {
                    String name = String.valueOf(param.get("name"));
                    String paramType = String.valueOf(param.get("parameterType"));
                    String value = String.valueOf(param.get("value"));

                    if ("reference".equals(paramType)) {
                        // Resolve reference like "输入节点.user_input"
                        Object resolved = context.resolveReference(value);
                        inputParams.put(name, resolved != null ? String.valueOf(resolved) : "");
                    } else {
                        // Direct input value
                        inputParams.put(name, value);
                    }
                }
            }
        }

        // Extract text from input parameters
        String textInput = inputParams.getOrDefault("text", "");

        // If no text from input parameters, collect upstream text as fallback
        if (textInput.isEmpty()) {
            StringBuilder upstreamText = new StringBuilder();
            for (Map.Entry<String, Map<String, Object>> entry : context.getAllOutputs().entrySet()) {
                if (!"__userInput__".equals(entry.getKey())) {
                    Object text = entry.getValue().get("text");
                    if (text != null) {
                        upstreamText.append(text);
                    }
                }
            }
            textInput = upstreamText.toString();
        }

        // Extract voice and language_type from input parameters
        String voice = inputParams.getOrDefault("voice", "Cherry");
        String languageType = inputParams.getOrDefault("language_type", "Auto");

        log.info("ToolNode [{}] Starting TTS synthesis (model={}, voice={}, languageType={})",
                nodeId, modelName, voice, languageType);

        // Call TTS Provider
        TTSProvider ttsProvider = ttsProviderFactory.getProvider("aliyun");
        TTSRequest ttsRequest = new TTSRequest();
        ttsRequest.setText(textInput);
        ttsRequest.setModel(modelName);
        ttsRequest.setVoice(voice);
        ttsRequest.setLanguageType(languageType);
        ttsRequest.setApiKey(apiKey);

        TTSResponse ttsResponse = ttsProvider.synthesize(ttsRequest);

        log.info("ToolNode [{}] TTS synthesis completed, voiceUrl={}", nodeId, ttsResponse.getVoiceUrl());

        // Build outputs based on configured output parameters
        Map<String, Object> outputs = buildOutputs(nodeData, ttsResponse, textInput);
        return outputs;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildOutputs(Map<String, Object> nodeData, TTSResponse ttsResponse, String textInput) {
        Map<String, Object> outputs = new HashMap<>();

        // Check if custom output parameters are configured
        Object outputParamsObj = nodeData.get("outputParameters");
        if (outputParamsObj instanceof List<?> outputParams && !outputParams.isEmpty()) {
            // Use custom output parameters
            for (Object item : outputParams) {
                if (item instanceof Map<?, ?> param) {
                    String name = String.valueOf(param.get("name"));
                    String type = String.valueOf(param.get("type"));

                    // Map TTS response fields to output parameters
                    switch (name) {
                        case "audioUrl":
                            outputs.put(name, ttsResponse.getVoiceUrl());
                            break;
                        case "voice_url":
                            outputs.put(name, ttsResponse.getVoiceUrl());
                            break;
                        case "duration":
                            outputs.put(name, ttsResponse.getDuration());
                            break;
                        case "text":
                            outputs.put(name, textInput);
                            break;
                        default:
                            outputs.put(name, "");
                    }
                }
            }
        } else {
            // Default outputs for backward compatibility
            outputs.put("audioUrl", ttsResponse.getVoiceUrl());
            outputs.put("voice_url", ttsResponse.getVoiceUrl());
            outputs.put("duration", ttsResponse.getDuration());
            outputs.put("text", textInput);
        }

        return outputs;
    }
}
