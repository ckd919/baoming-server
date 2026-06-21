package com.xiaozongxiong.baoming.submission.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class SubmitRequest {
    @NotBlank(message = "缺少提交ID")
    private String id;

    @NotBlank(message = "请输入手机号码")
    private String phone;

    private Map<String, Object> data;
    private Long submittedAt;
    private String token;
}
