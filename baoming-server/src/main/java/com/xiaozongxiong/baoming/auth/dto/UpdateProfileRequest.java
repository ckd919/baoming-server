package com.xiaozongxiong.baoming.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private String avatarUrl;
    private String phone;
}
