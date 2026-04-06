package com.paiagent.node.service;

import com.paiagent.node.dto.NodeCategoryDTO;
import com.paiagent.node.dto.NodeDefinitionDTO;
import com.paiagent.node.entity.NodeDefinitionEntity;
import com.paiagent.node.repository.NodeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NodeDefinitionService {

    private final NodeDefinitionRepository repository;

    public List<NodeCategoryDTO> getGroupedDefinitions() {
        List<NodeDefinitionEntity> all = repository.findByEnabledTrueOrderBySortOrder();

        return all.stream()
                .collect(Collectors.groupingBy(NodeDefinitionEntity::getCategory))
                .entrySet().stream()
                .map(entry -> new NodeCategoryDTO(
                        entry.getKey(),
                        entry.getValue().stream()
                                .map(NodeDefinitionDTO::from)
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }
}
