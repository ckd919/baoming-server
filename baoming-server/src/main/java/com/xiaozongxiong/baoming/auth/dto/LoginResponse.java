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
        private String avatarUrl;
        private String realName;
        private String idCard;
    }

    public static LoginResponse from(User user, String token, Boolean isNew) {
        return LoginResponse.builder()
                .token(token)
                .user(UserInfo.builder()
                        .id(user.getId())
                        .phone(user.getPhone())
                        .nickname(user.getNickname() != null ? user.getNickname() : "")
                        .role(user.getRole() != null ? user.getRole() : "USER")
                        .avatarUrl(user.getAvatarUrl() != null ? user.getAvatarUrl() : "")
                        .realName(user.getRealName() != null ? user.getRealName() : "")
                        .idCard(user.getIdCard() != null ? user.getIdCard() : "")
                        .build())
                .isNew(isNew)
                .build();
    }
}
