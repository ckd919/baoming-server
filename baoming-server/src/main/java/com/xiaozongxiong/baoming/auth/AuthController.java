package com.xiaozongxiong.baoming.auth;

import com.xiaozongxiong.baoming.auth.dto.AdminLoginRequest;
import com.xiaozongxiong.baoming.auth.dto.AdminRegisterRequest;
import com.xiaozongxiong.baoming.auth.dto.LoginResponse;
import com.xiaozongxiong.baoming.auth.dto.UserPhoneLoginRequest;
import com.xiaozongxiong.baoming.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginRequest req) {
        return ResponseEntity.ok(authService.adminLogin(req));
    }

    @PostMapping("/admin/register")
    public ResponseEntity<?> adminRegister(@Valid @RequestBody AdminRegisterRequest req) {
        return ResponseEntity.ok(authService.adminRegister(req));
    }

    @PostMapping("/user/login")
    public ResponseEntity<?> userLogin(@Valid @RequestBody UserPhoneLoginRequest req) {
        return ResponseEntity.ok(authService.userPhoneLogin(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }
        LoginResponse resp = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(Map.of("user", resp.getUser()));
    }
}
