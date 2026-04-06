package com.paiagent.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkflowDTO {
    private Long id;

    @NotBlank(message = "工作流名称不能为空")
    private String name;

    @NotBlank(message = "流程定义不能为空")
    private String flowJson;

    private String description;
    private Integer version;
}
