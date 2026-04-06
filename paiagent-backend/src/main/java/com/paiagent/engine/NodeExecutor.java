package com.paiagent.engine;

import java.util.Map;

/**
 * Strategy interface for node execution.
 * Each node type (INPUT, LLM, TOOL, OUTPUT) has its own executor.
 */
public interface NodeExecutor {

    /**
     * @return the node type this executor handles, e.g. "INPUT", "LLM", "TOOL", "OUTPUT"
     */
    String getType();

    /**
     * Execute the node logic.
     *
     * @param nodeId     the unique node instance ID
     * @param nodeData   the node's configuration data from flow JSON
     * @param context    the shared execution context
     * @return output map of this node's results
     */
    Map<String, Object> execute(String nodeId, Map<String, Object> nodeData, ExecutionContext context);
}
