package com.xiaozongxiong.baoming.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("activities")
public class Activity {
    @TableId(type = IdType.INPUT)
    private String id;

    @TableField("user_id")
    private Integer userId;

    private String name;
    private String description;
    private String location;

    @TableField("start_time")
    private Long startTime;

    @TableField("end_time")
    private Long endTime;

    @TableField("max_participants")
    private Integer maxParticipants;

    private String status;
    private String fields;

    @TableField("submission_count")
    private Integer submissionCount;

    @TableField("allow_share")
    private Boolean allowShare;

    @TableField("invite_token")
    private String inviteToken;

    @TableField("verify_code")
    private String verifyCode;

    @TableField("wechat_only")
    private Boolean wechatOnly;

    @TableField("allowed_groups")
    private String allowedGroups;

    @TableField("share_level")
    private String shareLevel;

    @TableField("created_at")
    private Long createdAt;

    @TableField("updated_at")
    private Long updatedAt;
}
