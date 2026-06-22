package com.xiaozongxiong.baoming.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminRegisterRequest {
    @NotBlank(message = "请输入手机号")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号码格式不正确")
    private String phone;

    @NotBlank(message = "请输入密码")
    @Size(min = 6, message = "密码至少6位")
    private String password;

    private String nickname;
}
