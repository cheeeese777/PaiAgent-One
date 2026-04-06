package com.paiagent.engine;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * Shared data bus between node executions.
 * Structure: nodeId -> { fieldName -> value }
 */
@Slf4j
public class ExecutionContext {

    private final Map<String, Map<String, Object>> nodeOutputs = new HashMap<>();
    private final Map<String, String> labelToNodeId = new HashMap<>();

    public void registerLabel(String label, String nodeId) {
        labelToNodeId.put(label, nodeId);
    }

    public void putNodeOutput(String nodeId, Map<String, Object> outputs) {
        nodeOutputs.put(nodeId, outputs);
        log.debug("ExecutionContext: Stored output for node {} (label mapping: {}), outputs: {}", 
                nodeId, labelToNodeId.entrySet().stream()
                    .filter(e -> e.getValue().equals(nodeId))
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElse("none"), outputs.keySet());
    }

    public Map<String, Object> getNodeOutput(String nodeId) {
        return nodeOutputs.getOrDefault(nodeId, Map.of());
    }

    public Map<String, String> getLabelToNodeId() {
        return labelToNodeId;
    }

    public Map<String, Map<String, Object>> getAllOutputs() {
        return nodeOutputs;
    }

    /**
     * Resolve a reference like "通义千问.text" or "tool-1.audioUrl"
     */
    public Object resolveReference(String expression) {
        if (expression == null || !expression.contains(".")) {
            log.debug("ExecutionContext: Invalid expression: {}", expression);
            return null;
        }
        int dotIdx = expression.lastIndexOf('.');
        String nodeRef = expression.substring(0, dotIdx).trim();
        String field = expression.substring(dotIdx + 1).trim();

        // Try label first, then direct nodeId
        String nodeId = labelToNodeId.getOrDefault(nodeRef, nodeRef);
        log.debug("ExecutionContext: Resolving '{}' -> nodeId='{}', field='{}'", expression, nodeId, field);
        
        Map<String, Object> outputs = nodeOutputs.get(nodeId);
        if (outputs == null) {
            log.warn("ExecutionContext: No outputs found for node '{}', available nodes: {}", nodeId, nodeOutputs.keySet());
            return null;
        }
        
        Object result = outputs.get(field);
        log.debug("ExecutionContext: Resolved '{}' = {} (available fields: {})", expression, result, outputs.keySet());
        return result;
    }

    /**
     * Find text output from any upstream node (for simple workflows without output mappings)
     */
    public String findUpstreamTextOutput() {
        // Look for nodes with 'text' field in their output
        for (Map.Entry<String, Map<String, Object>> entry : nodeOutputs.entrySet()) {
            String nodeId = entry.getKey();
            // Skip internal nodes
            if (nodeId.startsWith("__")) {
                continue;
            }
            Map<String, Object> outputs = entry.getValue();
            if (outputs.containsKey("text")) {
                Object textValue = outputs.get("text");
                if (textValue != null) {
                    return String.valueOf(textValue);
                }
            }
        }
        return null;
    }
}
