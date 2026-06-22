package com.xiaozongxiong.baoming.activity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ActivityCreateRequest {
    @NotBlank(message = "缺少活动ID")
    private String id;
    private String name;
    private String description;
    private String location;
    private Long startTime;
    private Long endTime;
    private Integer maxParticipants;
    private String status;
    private List<Object> fields;
    private Boolean allowShare;
    private String inviteToken;
    private Boolean wechatOnly;
    private String shareLevel;
    private Boolean groupRestricted;
    private List<String> allowedGroups;
    private Long createdAt;
}
