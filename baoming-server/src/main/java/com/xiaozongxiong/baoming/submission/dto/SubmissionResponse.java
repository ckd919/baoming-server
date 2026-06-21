package com.xiaozongxiong.baoming.submission.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.model.Submission;
import lombok.Builder;
import lombok.Data;

import java.util.Collections;
import java.util.Map;

@Data
@Builder
public class SubmissionResponse {
    private static final ObjectMapper mapper = new ObjectMapper();

    private String id;
    private String activityId;
    private String activityName;
    private String phone;
    private Map<String, Object> data;
    private Long submittedAt;
    private boolean canCancel;

    @SuppressWarnings("unchecked")
    public static SubmissionResponse from(Submission s, String activityName, boolean canCancel) {
        Map<String, Object> dataMap = Collections.emptyMap();
        try {
            if (s.getData() != null && !s.getData().isEmpty() && !"{}".equals(s.getData())) {
                dataMap = mapper.readValue(s.getData(), new TypeReference<>() {});
            }
        } catch (JsonProcessingException ignored) {}

        return SubmissionResponse.builder()
                .id(s.getId())
                .activityId(s.getActivityId())
                .activityName(activityName)
                .phone(s.getPhone())
                .data(dataMap)
                .submittedAt(s.getSubmittedAt())
                .canCancel(canCancel)
                .build();
    }
}
