package com.paiagent.execution.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExecutionRequest {
    @NotNull(message = "工作流ID不能为空")
    private Long workflowId;

    private String inputData;
}
