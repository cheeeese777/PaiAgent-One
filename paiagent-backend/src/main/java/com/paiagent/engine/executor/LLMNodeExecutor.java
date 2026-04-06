package com.paiagent.engine.executor;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import com.paiagent.engine.llm.LLMProviderFactory;
import com.paiagent.engine.llm.LLMProvider;
import com.paiagent.engine.llm.LLMRequest;
import com.paiagent.engine.llm.LLMResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class LLMNodeExecutor implements NodeExecutor {

    private final LLMProviderFactory providerFactory;

    @Override
    public String getType() {
        return "LLM";
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context) {
        String provider = (String) nodeData.getOrDefault("provider", "mock");
        String model = (String) nodeData.getOrDefault("model", "default");
        String systemPrompt = (String) nodeData.getOrDefault("systemPrompt", "你是一个有帮助的AI助手。");
        Double temperature = nodeData.containsKey("temperature")
                ? Double.parseDouble(String.valueOf(nodeData.get("temperature")))
                : 0.7;

        // Process input parameters: [{name: "input", parameterType: "reference", value: "输入节点.user_input"}]
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

        // Process user prompt template (e.g., "请输入您的内容：{{input}}")
        String userPromptTemplate = (String) nodeData.get("userPrompt");
        String userMessage = "";
        
        log.info("LLM Node [{}] userPromptTemplate: {}", nodeId, userPromptTemplate);
        log.info("LLM Node [{}] inputParams: {}", nodeId, inputParams);
        
        if (userPromptTemplate != null && !userPromptTemplate.isEmpty()) {
            // Replace {{paramName}} with actual values
            userMessage = userPromptTemplate;
            for (Map.Entry<String, String> entry : inputParams.entrySet()) {
                userMessage = userMessage.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            log.info("LLM Node [{}] resolved userMessage: {}", nodeId, 
                    userMessage.length() > 200 ? userMessage.substring(0, 200) + "..." : userMessage);
        } else {
            // Fallback: use first input parameter or collect upstream text
            if (!inputParams.isEmpty()) {
                userMessage = inputParams.values().iterator().next();
            } else {
                userMessage = collectUpstreamText(context);
            }
            log.info("LLM Node [{}] using fallback userMessage: {}", nodeId, 
                    userMessage.length() > 200 ? userMessage.substring(0, 200) + "..." : userMessage);
        }

        LLMProvider llmProvider = providerFactory.getProvider(provider);
        LLMRequest request = new LLMRequest(systemPrompt, userMessage, model, temperature);
        LLMResponse response = llmProvider.chat(request);

        log.info("LLM node [{}] using provider={}, model={}, tokens={}",
                nodeId, provider, model, response.getTokenCount());

        // Build outputs based on custom output parameters or defaults
        Map<String, Object> outputs = buildOutputs(nodeData, response);
        return outputs;
    }

    /**
     * Build output map based on custom output parameters configuration.
     * If no custom parameters defined, use default {text, tokenCount}.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildOutputs(Map<String, Object> nodeData, LLMResponse response) {
        Map<String, Object> outputs = new HashMap<>();
        
        Object outputParamsObj = nodeData.get("outputParameters");
        if (outputParamsObj instanceof List<?> outputParams && !outputParams.isEmpty()) {
            // Use custom output parameters
            for (Object item : outputParams) {
                if (item instanceof Map<?, ?> param) {
                    String name = String.valueOf(param.get("name"));
                    String type = String.valueOf(param.get("type"));
                    
                    // Currently only support string type, map all to response text
                    if ("string".equals(type)) {
                        outputs.put(name, response.getText());
                    }
                }
            }
        } else {
            // Default behavior: always include text and tokenCount
            outputs.put("text", response.getText());
            outputs.put("tokenCount", response.getTokenCount());
        }
        
        return outputs;
    }

    /**
     * Collect text from all upstream nodes (fallback behavior)
     */
    private String collectUpstreamText(ExecutionContext context) {
        StringBuilder sb = new StringBuilder();
        Map<String, Map<String, Object>> allOutputs = context.getAllOutputs();
        for (Map.Entry<String, Map<String, Object>> entry : allOutputs.entrySet()) {
            if (!"__userInput__".equals(entry.getKey())) {
                Object text = entry.getValue().get("text");
                if (text != null) {
                    sb.append(text).append("\n");
                }
            }
        }
        return sb.length() > 0 ? sb.toString().trim() : "(无输入)";
    }
}
