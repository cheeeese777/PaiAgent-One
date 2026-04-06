package com.paiagent.workflow.controller;

import com.paiagent.auth.entity.UserEntity;
import com.paiagent.auth.service.AuthService;
import com.paiagent.common.result.R;
import com.paiagent.workflow.dto.WorkflowDTO;
import com.paiagent.workflow.dto.WorkflowListDTO;
import com.paiagent.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;
    private final AuthService authService;

    @GetMapping
    public R<List<WorkflowListDTO>> list(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(workflowService.listByUser(user.getId()));
    }

    @GetMapping("/{id}")
    public R<WorkflowDTO> get(@PathVariable Long id,
                              @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(workflowService.getById(id, user.getId()));
    }

    @PostMapping
    public R<WorkflowDTO> create(@Valid @RequestBody WorkflowDTO dto,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(workflowService.create(dto, user.getId()));
    }

    @PutMapping("/{id}")
    public R<WorkflowDTO> update(@PathVariable Long id,
                                 @Valid @RequestBody WorkflowDTO dto,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(workflowService.update(id, dto, user.getId()));
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id,
                          @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        workflowService.delete(id, user.getId());
        return R.ok();
    }
}
