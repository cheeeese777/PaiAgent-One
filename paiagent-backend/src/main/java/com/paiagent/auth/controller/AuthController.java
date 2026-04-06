package com.paiagent.auth.controller;

import com.paiagent.auth.dto.LoginRequest;
import com.paiagent.auth.dto.LoginResponse;
import com.paiagent.auth.entity.UserEntity;
import com.paiagent.auth.service.AuthService;
import com.paiagent.common.result.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public R<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return R.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public R<Map<String, Object>> profile(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = authService.getCurrentUser(userDetails.getUsername());
        return R.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()
        ));
    }
}
