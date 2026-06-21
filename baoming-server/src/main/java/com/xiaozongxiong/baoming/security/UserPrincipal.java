package com.xiaozongxiong.baoming.security;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserPrincipal {
    private Integer id;
    private String phone;
    private String role;
}
