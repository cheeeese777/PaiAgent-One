package com.paiagent.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class FlowParser {

    private final ObjectMapper objectMapper;

    @Data
    public static class FlowNode {
        private String id;
        private String type;
        private Map<String, Object> data;
        private Map<String, Object> position;
    }

    @Data
    public static class FlowEdge {
        private String id;
        private String source;
        private String target;
    }

    @Data
    public static class ParsedFlow {
        private List<FlowNode> sortedNodes;
        private Map<String, FlowNode> nodeMap;
        private Map<String, List<String>> adjacency;
        private Map<String, String> labelToNodeId;
    }

    public ParsedFlow parse(String flowJson) {
        try {
            Map<String, Object> flow = objectMapper.readValue(flowJson, new TypeReference<>() {});

            List<FlowNode> nodes = objectMapper.convertValue(
                    flow.get("nodes"), new TypeReference<List<FlowNode>>() {});
            List<FlowEdge> edges = objectMapper.convertValue(
                    flow.get("edges"), new TypeReference<List<FlowEdge>>() {});

            if (nodes == null || nodes.isEmpty()) {
                throw new IllegalArgumentException("工作流中没有节点");
            }

            // Build node map and label mapping
            Map<String, FlowNode> nodeMap = new LinkedHashMap<>();
            Map<String, String> labelToNodeId = new HashMap<>();
            for (FlowNode node : nodes) {
                nodeMap.put(node.getId(), node);
                if (node.getData() != null && node.getData().containsKey("label")) {
                    labelToNodeId.put(String.valueOf(node.getData().get("label")), node.getId());
                }
            }

            // Build adjacency list
            Map<String, List<String>> adjacency = new HashMap<>();
            Map<String, Integer> inDegree = new HashMap<>();
            for (FlowNode node : nodes) {
                adjacency.put(node.getId(), new ArrayList<>());
                inDegree.put(node.getId(), 0);
            }

            if (edges != null) {
                for (FlowEdge edge : edges) {
                    adjacency.get(edge.getSource()).add(edge.getTarget());
                    inDegree.merge(edge.getTarget(), 1, Integer::sum);
                }
            }

            // Kahn's algorithm for topological sort
            Queue<String> queue = new LinkedList<>();
            for (Map.Entry<String, Integer> entry : inDegree.entrySet()) {
                if (entry.getValue() == 0) {
                    queue.add(entry.getKey());
                }
            }

            List<FlowNode> sorted = new ArrayList<>();
            while (!queue.isEmpty()) {
                String nodeId = queue.poll();
                sorted.add(nodeMap.get(nodeId));
                for (String neighbor : adjacency.get(nodeId)) {
                    inDegree.merge(neighbor, -1, Integer::sum);
                    if (inDegree.get(neighbor) == 0) {
                        queue.add(neighbor);
                    }
                }
            }

            if (sorted.size() != nodes.size()) {
                throw new IllegalArgumentException("工作流中存在环路，无法执行");
            }

            ParsedFlow result = new ParsedFlow();
            result.setSortedNodes(sorted);
            result.setNodeMap(nodeMap);
            result.setAdjacency(adjacency);
            result.setLabelToNodeId(labelToNodeId);
            return result;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse flow JSON", e);
            throw new IllegalArgumentException("工作流 JSON 解析失败: " + e.getMessage());
        }
    }
}
