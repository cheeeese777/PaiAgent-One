package com.paiagent.workflow.repository;

import com.paiagent.workflow.entity.WorkflowEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowRepository extends JpaRepository<WorkflowEntity, Long> {
    List<WorkflowEntity> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
