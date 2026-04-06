package com.paiagent.engine;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NodeExecutorRegistry {

    private final ApplicationContext applicationContext;
    private final Map<String, NodeExecutor> executors = new HashMap<>();

    @PostConstruct
    public void init() {
        Map<String, NodeExecutor> beans = applicationContext.getBeansOfType(NodeExecutor.class);
        for (NodeExecutor executor : beans.values()) {
            executors.put(executor.getType().toUpperCase(), executor);
        }
    }

    public NodeExecutor getExecutor(String nodeType) {
        NodeExecutor executor = executors.get(nodeType.toUpperCase());
        if (executor == null) {
            throw new IllegalArgumentException("No executor registered for node type: " + nodeType);
        }
        return executor;
    }
}
