package com.paiagent.execution.dto;

import com.paiagent.common.enums.ExecutionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExecutionResponse {
    private Long id;
    private Long workflowId;
    private ExecutionStatus status;
    private String inputData;
    private String outputData;
    private String nodeResults;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationMs;
}
