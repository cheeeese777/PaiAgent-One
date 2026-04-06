package com.paiagent.node.dto;

import lombok.Data;

import java.util.List;

@Data
public class NodeCategoryDTO {
    private String category;
    private List<NodeDefinitionDTO> nodes;

    public NodeCategoryDTO(String category, List<NodeDefinitionDTO> nodes) {
        this.category = category;
        this.nodes = nodes;
    }
}
