package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@TableName("cancel_requests")
public class CancelRequest {
    @TableId(type = IdType.AUTO) private Integer id;
    @TableField("submission_id") private String submissionId;
    @TableField("activity_id") private String activityId;
    @TableField("user_id") private Integer userId;
    private String reason;
    private String status;  // pending/approved/rejected
    @TableField("reviewed_by") private Integer reviewedBy;
    @TableField("reviewed_at") private Long reviewedAt;
    @TableField("created_at") private Long createdAt;

    @TableField(exist = false) private String nickname;
    @TableField(exist = false) private String activityName;
}
