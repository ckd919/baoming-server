package com.xiaozongxiong.baoming.activity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminAddRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;
}
