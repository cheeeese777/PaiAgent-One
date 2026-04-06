package com.paiagent.workflow.service;

import com.paiagent.common.exception.BizException;
import com.paiagent.workflow.dto.WorkflowDTO;
import com.paiagent.workflow.dto.WorkflowListDTO;
import com.paiagent.workflow.entity.WorkflowEntity;
import com.paiagent.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository repository;

    public List<WorkflowListDTO> listByUser(Long userId) {
        return repository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(WorkflowListDTO::from)
                .collect(Collectors.toList());
    }

    public WorkflowDTO getById(Long id, Long userId) {
        WorkflowEntity entity = repository.findById(id)
                .orElseThrow(() -> new BizException(404, "工作流不存在"));
        if (!entity.getUserId().equals(userId)) {
            throw new BizException(403, "无权访问此工作流");
        }
        WorkflowDTO dto = new WorkflowDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setFlowJson(entity.getFlowJson());
        dto.setDescription(entity.getDescription());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    @Transactional
    public WorkflowDTO create(WorkflowDTO dto, Long userId) {
        WorkflowEntity entity = new WorkflowEntity();
        entity.setName(dto.getName());
        entity.setFlowJson(dto.getFlowJson());
        entity.setDescription(dto.getDescription());
        entity.setUserId(userId);
        entity.setVersion(1);
        entity = repository.save(entity);
        dto.setId(entity.getId());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    @Transactional
    public WorkflowDTO update(Long id, WorkflowDTO dto, Long userId) {
        WorkflowEntity entity = repository.findById(id)
                .orElseThrow(() -> new BizException(404, "工作流不存在"));
        if (!entity.getUserId().equals(userId)) {
            throw new BizException(403, "无权修改此工作流");
        }
        entity.setName(dto.getName());
        entity.setFlowJson(dto.getFlowJson());
        entity.setDescription(dto.getDescription());
        entity.setVersion(entity.getVersion() + 1);
        entity = repository.save(entity);
        dto.setId(entity.getId());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    @Transactional
    public void delete(Long id, Long userId) {
        WorkflowEntity entity = repository.findById(id)
                .orElseThrow(() -> new BizException(404, "工作流不存在"));
        if (!entity.getUserId().equals(userId)) {
            throw new BizException(403, "无权删除此工作流");
        }
        repository.delete(entity);
    }
}
