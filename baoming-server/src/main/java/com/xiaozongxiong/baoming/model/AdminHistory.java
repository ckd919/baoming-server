package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@TableName("admin_history")
public class AdminHistory {
    @TableId(type = IdType.AUTO) private Integer id;
    @TableField("owner_id") private Integer ownerId;
    @TableField("admin_id") private Integer adminId;
    @TableField("created_at") private Long createdAt;

    @TableField(exist = false) private String phone;
    @TableField(exist = false) private String nickname;
    @TableField(exist = false) private String avatarUrl;
}
