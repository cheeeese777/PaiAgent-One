package com.paiagent.engine.executor;

import com.paiagent.engine.ExecutionContext;
import com.paiagent.engine.NodeExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class ToolNodeExecutor implements NodeExecutor {

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

    private Map<String, Object> executeVoiceSynthesis(String nodeId, Map<String, Object> nodeData,
                                                       ExecutionContext context) {
        // Collect upstream text
        StringBuilder textInput = new StringBuilder();
        for (Map.Entry<String, Map<String, Object>> entry : context.getAllOutputs().entrySet()) {
            if (!"__userInput__".equals(entry.getKey())) {
                Object text = entry.getValue().get("text");
                if (text != null) {
                    textInput.append(text);
                }
            }
        }

        try {
            // Simulate voice synthesis latency
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock audio URL
        String audioId = UUID.randomUUID().toString().substring(0, 8);
        String audioUrl = "/api/mock/audio/" + audioId + ".mp3";

        log.info("ToolNode [{}] voice synthesis completed, audioUrl={}", nodeId, audioUrl);

        Map<String, Object> outputs = new HashMap<>();
        outputs.put("audioUrl", audioUrl);
        outputs.put("duration", 30);
        outputs.put("text", textInput.toString());
        return outputs;
    }
}
