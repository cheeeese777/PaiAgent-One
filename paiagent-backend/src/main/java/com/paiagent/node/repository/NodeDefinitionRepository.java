package com.paiagent.node.repository;

import com.paiagent.node.entity.NodeDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NodeDefinitionRepository extends JpaRepository<NodeDefinitionEntity, Long> {
    List<NodeDefinitionEntity> findByEnabledTrueOrderBySortOrder();
    Optional<NodeDefinitionEntity> findByNodeKey(String nodeKey);
}
