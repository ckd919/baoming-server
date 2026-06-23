package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@TableName("activity_comments")
public class ActivityComment {
    @TableId(type = IdType.AUTO) private Integer id;
    @TableField("activity_id") private String activityId;
    @TableField("user_id") private Integer userId;
    private String content;
    @TableField("created_at") private Long createdAt;

    @TableField(exist = false) private String nickname;
    @TableField(exist = false) private String avatarUrl;
}
