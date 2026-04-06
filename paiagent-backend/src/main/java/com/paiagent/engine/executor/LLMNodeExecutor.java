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
    public Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context) {
        String provider = (String) nodeData.getOrDefault("provider", "mock");
        String model = (String) nodeData.getOrDefault("model", "default");
        String systemPrompt = (String) nodeData.getOrDefault("systemPrompt", "你是一个有帮助的AI助手。");
        Double temperature = nodeData.containsKey("temperature")
                ? Double.parseDouble(String.valueOf(nodeData.get("temperature")))
                : 0.7;

        // Collect upstream text inputs
        StringBuilder userMessage = new StringBuilder();
        Map<String, Map<String, Object>> allOutputs = context.getAllOutputs();
        for (Map.Entry<String, Map<String, Object>> entry : allOutputs.entrySet()) {
            if (!"__userInput__".equals(entry.getKey())) {
                Object text = entry.getValue().get("text");
                if (text != null) {
                    userMessage.append(text).append("\n");
                }
            }
        }

        if (userMessage.isEmpty()) {
            userMessage.append("(无输入)");
        }

        LLMProvider llmProvider = providerFactory.getProvider(provider);
        LLMRequest request = new LLMRequest(systemPrompt, userMessage.toString().trim(), model, temperature);
        LLMResponse response = llmProvider.chat(request);

        log.info("LLM node [{}] using provider={}, model={}, tokens={}",
                nodeId, provider, model, response.getTokenCount());

        Map<String, Object> outputs = new HashMap<>();
        outputs.put("text", response.getText());
        outputs.put("tokenCount", response.getTokenCount());
        return outputs;
    }
}
