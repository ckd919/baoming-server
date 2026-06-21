package com.xiaozongxiong.baoming.auth.dto;

import com.xiaozongxiong.baoming.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserInfo user;
    private Boolean isNew;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Integer id;
        private String phone;
        private String nickname;
        private String role;
    }

    public static LoginResponse from(User user, String token, Boolean isNew) {
        return LoginResponse.builder()
                .token(token)
                .user(UserInfo.builder()
                        .id(user.getId())
                        .phone(user.getPhone())
                        .nickname(user.getNickname() != null ? user.getNickname() : "")
                        .role(user.getRole() != null ? user.getRole() : "USER")
                        .build())
                .isNew(isNew)
                .build();
    }
}
