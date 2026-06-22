package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("activity_admins")
public class ActivityAdmin {
    @TableId(type = IdType.AUTO)
    private Integer id;

    @TableField("activity_id")
    private String activityId;

    @TableField("user_id")
    private Integer userId;

    private String role;

    @TableField("created_at")
    private Long createdAt;

    // 以下字段为 JOIN 查询时填充，非数据库字段
    @TableField(exist = false)
    private String phone;

    @TableField(exist = false)
    private String nickname;

    @TableField(exist = false)
    private String avatarUrl;
}
