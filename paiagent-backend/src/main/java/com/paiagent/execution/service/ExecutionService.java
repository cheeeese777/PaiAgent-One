package com.paiagent.execution.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.common.enums.ExecutionStatus;
import com.paiagent.common.exception.BizException;
import com.paiagent.engine.WorkflowEngine;
import com.paiagent.execution.dto.ExecutionRequest;
import com.paiagent.execution.dto.ExecutionResponse;
import com.paiagent.execution.entity.WorkflowExecutionEntity;
import com.paiagent.execution.repository.ExecutionRepository;
import com.paiagent.workflow.entity.WorkflowEntity;
import com.paiagent.workflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final ExecutionRepository executionRepository;
    private final WorkflowRepository workflowRepository;
    private final WorkflowEngine workflowEngine;
    private final ObjectMapper objectMapper;

    public ExecutionResponse run(ExecutionRequest request, Long userId) {
        WorkflowEntity workflow = workflowRepository.findById(request.getWorkflowId())
                .orElseThrow(() -> new BizException(404, "工作流不存在"));

        if (!workflow.getUserId().equals(userId)) {
            throw new BizException(403, "无权执行此工作流");
        }

        // Wrap input data as JSON object
        String inputDataJson;
        try {
            Map<String, Object> inputDataMap = Map.of("text", request.getInputData() != null ? request.getInputData() : "");
            inputDataJson = objectMapper.writeValueAsString(inputDataMap);
        } catch (Exception e) {
            throw new BizException(500, "输入数据格式化失败");
        }

        // Create execution record
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.setWorkflowId(workflow.getId());
        execution.setUserId(userId);
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setInputData(inputDataJson);
        execution.setStartedAt(LocalDateTime.now());
        execution = executionRepository.save(execution);

        long startTime = System.currentTimeMillis();

        try {
            Map<String, Map<String, Object>> nodeResults =
                    workflowEngine.execute(workflow.getFlowJson(), request.getInputData(), execution.getId());

            long duration = System.currentTimeMillis() - startTime;

            execution.setStatus(ExecutionStatus.SUCCESS);
            execution.setNodeResults(objectMapper.writeValueAsString(nodeResults));

            // Extract final output from the last OUTPUT node
            String outputData = extractFinalOutput(nodeResults);
            // Ensure output_data is valid JSON (not empty string)
            if (outputData == null || outputData.isEmpty()) {
                outputData = "{}";
            } else if (!outputData.trim().startsWith("{") && !outputData.trim().startsWith("[")) {
                // If it's plain text, wrap it as JSON
                outputData = objectMapper.writeValueAsString(Map.of("result", outputData));
            }
            execution.setOutputData(outputData);
            execution.setFinishedAt(LocalDateTime.now());
            execution.setDurationMs(duration);

            execution = executionRepository.save(execution);

            log.info("Workflow execution {} completed in {}ms", execution.getId(), duration);

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            execution.setStatus(ExecutionStatus.FAILED);
            execution.setErrorMessage(e.getMessage());
            execution.setFinishedAt(LocalDateTime.now());
            execution.setDurationMs(duration);
            executionRepository.save(execution);

            log.error("Workflow execution {} failed", execution.getId(), e);
        }

        return toResponse(execution);
    }

    public ExecutionResponse getById(Long id) {
        WorkflowExecutionEntity execution = executionRepository.findById(id)
                .orElseThrow(() -> new BizException(404, "执行记录不存在"));
        return toResponse(execution);
    }

    private String extractFinalOutput(Map<String, Map<String, Object>> nodeResults) {
        // Find the output node results and extract __response__
        for (Map.Entry<String, Map<String, Object>> entry : nodeResults.entrySet()) {
            Map<String, Object> result = entry.getValue();
            if (result.containsKey("output") && result.get("output") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> output = (Map<String, Object>) result.get("output");
                if (output.containsKey("__response__")) {
                    return String.valueOf(output.get("__response__"));
                }
            }
        }
        try {
            return objectMapper.writeValueAsString(nodeResults);
        } catch (Exception e) {
            return "{}";
        }
    }

    private ExecutionResponse toResponse(WorkflowExecutionEntity entity) {
        ExecutionResponse response = new ExecutionResponse();
        response.setId(entity.getId());
        response.setWorkflowId(entity.getWorkflowId());
        response.setStatus(entity.getStatus());
        response.setInputData(entity.getInputData());
        response.setOutputData(entity.getOutputData());
        response.setNodeResults(entity.getNodeResults());
        response.setErrorMessage(entity.getErrorMessage());
        response.setStartedAt(entity.getStartedAt());
        response.setFinishedAt(entity.getFinishedAt());
        response.setDurationMs(entity.getDurationMs());
        return response;
    }
}
