package com.paiagent.engine.executor;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class InputNodeExecutor implements NodeExecutor {

    @Override
    public String getType() {
        return "INPUT";
    }

    @Override
    public Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context) {
        // Read user input from the special __userInput__ slot
        Map<String, Object> userInput = context.getNodeOutput("__userInput__");
        String text = userInput != null ? String.valueOf(userInput.getOrDefault("text", "")) : "";
        return Map.of("text", text);
    }
}
