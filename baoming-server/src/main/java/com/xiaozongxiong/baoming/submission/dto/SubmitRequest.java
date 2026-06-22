package com.xiaozongxiong.baoming.submission.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class SubmitRequest {
    @NotBlank(message = "缺少提交ID")
    private String id;

    private String phone;  // 可选，登录用户自动获取

    private Map<String, Object> data;
    private Long submittedAt;
    private String token;
}
