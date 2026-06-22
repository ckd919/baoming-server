package com.xiaozongxiong.baoming.auth;

import com.xiaozongxiong.baoming.auth.dto.*;
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

    /** 微信授权登录 — 不强制手机号 */
    @PostMapping("/wechat-login")
    public ResponseEntity<?> wechatLogin(@Valid @RequestBody WechatLoginRequest req) {
        LoginResponse resp = authService.wechatLogin(req);
        return ResponseEntity.ok(resp);
    }

    /** 绑定手机号 — 登录后可选操作 */
    @PostMapping("/bind-phone")
    public ResponseEntity<?> bindPhone(@Valid @RequestBody BindPhoneRequest req,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        LoginResponse resp = authService.bindPhone(principal.getId(), req);
        return ResponseEntity.ok(Map.of("user", resp.getUser(), "message", "手机号绑定成功"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }
        LoginResponse resp = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(Map.of("user", resp.getUser()));
    }

    /** 更新个人信息（昵称、头像） */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        LoginResponse resp = authService.updateProfile(principal.getId(), req);
        return ResponseEntity.ok(Map.of("user", resp.getUser()));
    }
}
