package com.paiagent.workflow.dto;

import com.paiagent.workflow.entity.WorkflowEntity;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkflowListDTO {
    private Long id;
    private String name;
    private String description;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkflowListDTO from(WorkflowEntity entity) {
        WorkflowListDTO dto = new WorkflowListDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setVersion(entity.getVersion());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
