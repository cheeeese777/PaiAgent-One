package com.paiagent.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowEngine {

    private final FlowParser flowParser;
    private final NodeExecutorRegistry executorRegistry;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Execute a workflow.
     *
     * @param flowJson    the workflow definition JSON
     * @param inputData   user input string
     * @param executionId execution tracking ID (for WebSocket updates)
     * @return map of all node outputs
     */
    public Map<String, Map<String, Object>> execute(String flowJson, String inputData, Long executionId) {
        FlowParser.ParsedFlow parsed = flowParser.parse(flowJson);

        ExecutionContext context = new ExecutionContext();

        // Register all label -> nodeId mappings
        for (Map.Entry<String, String> entry : parsed.getLabelToNodeId().entrySet()) {
            context.registerLabel(entry.getKey(), entry.getValue());
        }

        // Parse input data JSON and store in context
        Map<String, Object> userInput;
        try {
            if (inputData != null && !inputData.isEmpty()) {
                userInput = objectMapper.readValue(inputData, Map.class);
            } else {
                userInput = Map.of("text", "");
            }
        } catch (Exception e) {
            log.warn("Failed to parse input data, using empty text", e);
            userInput = Map.of("text", "");
        }
        context.putNodeOutput("__userInput__", userInput);

        Map<String, Map<String, Object>> nodeResults = new HashMap<>();

        for (FlowParser.FlowNode node : parsed.getSortedNodes()) {
            String nodeId = node.getId();
            String nodeType = resolveNodeType(node);
            Map<String, Object> nodeData = node.getData() != null ? node.getData() : Map.of();

            // Send WebSocket progress: node started
            sendProgress(executionId, nodeId, nodeData, "node_start", null);

            try {
                long startTime = System.currentTimeMillis();

                NodeExecutor executor = executorRegistry.getExecutor(nodeType);
                Map<String, Object> outputs = executor.execute(nodeId, nodeData, context);
                context.putNodeOutput(nodeId, outputs);

                long duration = System.currentTimeMillis() - startTime;
                Map<String, Object> result = new HashMap<>();
                result.put("status", "SUCCESS");
                result.put("output", outputs);
                result.put("durationMs", duration);
                nodeResults.put(nodeId, result);

                // Send WebSocket progress: node completed
                sendProgress(executionId, nodeId, nodeData, "node_complete", outputs);

                log.info("Node [{}] ({}) executed in {}ms", nodeId, nodeData.get("label"), duration);

            } catch (Exception e) {
                log.error("Node [{}] execution failed", nodeId, e);

                Map<String, Object> result = new HashMap<>();
                result.put("status", "FAILED");
                result.put("error", e.getMessage());
                nodeResults.put(nodeId, result);

                sendProgress(executionId, nodeId, nodeData, "node_error",
                        Map.of("error", e.getMessage()));

                throw new RuntimeException("节点 [" + nodeData.getOrDefault("label", nodeId) + "] 执行失败: " + e.getMessage(), e);
            }
        }

        return nodeResults;
    }

    private String resolveNodeType(FlowParser.FlowNode node) {
        String type = node.getType();
        if (type == null) return "INPUT";

        return switch (type.toLowerCase()) {
            case "input" -> "INPUT";
            case "llm" -> "LLM";
            case "tool" -> "TOOL";
            case "output" -> "OUTPUT";
            default -> type.toUpperCase();
        };
    }

    private void sendProgress(Long executionId, String nodeId, Map<String, Object> nodeData,
                              String type, Map<String, Object> data) {
        if (executionId == null) return;
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", type);
            message.put("nodeId", nodeId);
            message.put("nodeLabel", nodeData != null ? nodeData.get("label") : nodeId);
            message.put("data", data);
            message.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/execution/" + executionId, message);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket progress", e);
        }
    }
}
