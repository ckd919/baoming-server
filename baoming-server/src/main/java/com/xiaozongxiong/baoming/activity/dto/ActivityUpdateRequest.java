package com.xiaozongxiong.baoming.activity.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ActivityUpdateRequest {
    private String name;
    private String description;
    private String location;
    private Long startTime;
    private Long endTime;
    private Integer maxParticipants;
    private String status;
    private Integer submissionCount;
    private Boolean allowShare;
    private String inviteToken;
    private Boolean wechatOnly;
    private String shareLevel;
    private Boolean groupRestricted;
    private List<Map<String, Object>> fields;
    private List<String> allowedGroups;
}
