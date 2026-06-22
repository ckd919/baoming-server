package com.xiaozongxiong.baoming.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BindPhoneRequest {
    @NotBlank(message = "code不能为空")
    private String code;
    @NotBlank(message = "encryptedData不能为空")
    private String encryptedData;
    @NotBlank(message = "iv不能为空")
    private String iv;
}
