package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String phone;
    private String password;
    private String nickname;
    private String role;
    private String openid;

    @TableField("avatar_url")
    private String avatarUrl;

    @TableField("real_name")
    private String realName;

    @TableField("id_card")
    private String idCard;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
