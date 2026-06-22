package com.xiaozongxiong.baoming.activity.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.model.Activity;
import lombok.Builder;
import lombok.Data;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ActivityResponse {
    private static final ObjectMapper mapper = new ObjectMapper();

    private String id;
    private Integer userId;
    private String name;
    private String description;
    private String location;
    private Long startTime;
    private Long endTime;
    private Integer maxParticipants;
    private String status;
    private List<Map<String, Object>> fields;
    private Integer submissionCount;
    private Boolean allowShare;
    private String inviteToken;
    private String verifyCode;
    private Boolean wechatOnly;
    private String shareLevel;
    private Boolean groupRestricted;
    private List<String> allowedGroups;
    private Long createdAt;
    private Long updatedAt;

    public static ActivityResponse from(Activity a) {
        return ActivityResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .name(a.getName())
                .description(a.getDescription())
                .location(a.getLocation())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .maxParticipants(a.getMaxParticipants())
                .status(a.getStatus())
                .fields(parseJsonList(a.getFields()))
                .submissionCount(a.getSubmissionCount())
                .allowShare(a.getAllowShare())
                .inviteToken(a.getInviteToken())
                .verifyCode(a.getVerifyCode())
                .wechatOnly(a.getWechatOnly())
                .shareLevel(a.getShareLevel() != null ? a.getShareLevel() : (Boolean.FALSE.equals(a.getAllowShare()) ? "creator" : "all"))
                .groupRestricted(a.getGroupRestricted())
                .allowedGroups(parseStringList(a.getAllowedGroups()))
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> parseJsonList(String json) {
        try {
            if (json == null || json.isEmpty() || "[]".equals(json)) return Collections.emptyList();
            return mapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private static List<String> parseStringList(String json) {
        try {
            if (json == null || json.isEmpty() || "[]".equals(json)) return Collections.emptyList();
            return mapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
