package com.paiagent.node.dto;

import com.paiagent.node.entity.NodeDefinitionEntity;
import lombok.Data;

@Data
public class NodeDefinitionDTO {
    private Long id;
    private String nodeKey;
    private String nodeType;
    private String label;
    private String category;
    private String iconUrl;
    private String configSchema;
    private String defaultConfig;

    public static NodeDefinitionDTO from(NodeDefinitionEntity entity) {
        NodeDefinitionDTO dto = new NodeDefinitionDTO();
        dto.setId(entity.getId());
        dto.setNodeKey(entity.getNodeKey());
        dto.setNodeType(entity.getNodeType());
        dto.setLabel(entity.getLabel());
        dto.setCategory(entity.getCategory());
        dto.setIconUrl(entity.getIconUrl());
        dto.setConfigSchema(entity.getConfigSchema());
        dto.setDefaultConfig(entity.getDefaultConfig());
        return dto;
    }
}
