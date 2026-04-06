package com.paiagent.execution.controller;

import com.paiagent.auth.entity.UserEntity;
import com.paiagent.auth.service.AuthService;
import com.paiagent.common.result.R;
import com.paiagent.execution.dto.ExecutionRequest;
import com.paiagent.execution.dto.ExecutionResponse;
import com.paiagent.execution.service.ExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;
    private final AuthService authService;

    @PostMapping("/run")
    public R<ExecutionResponse> run(@Valid @RequestBody ExecutionRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(executionService.run(request, user.getId()));
    }

    @GetMapping("/{id}")
    public R<ExecutionResponse> get(@PathVariable Long id) {
        return R.ok(executionService.getById(id));
    }
}
