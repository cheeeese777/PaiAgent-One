package com.paiagent.execution.repository;

import com.paiagent.execution.entity.WorkflowExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionRepository extends JpaRepository<WorkflowExecutionEntity, Long> {
    List<WorkflowExecutionEntity> findByWorkflowIdOrderByStartedAtDesc(Long workflowId);
}
