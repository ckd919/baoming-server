package com.xiaozongxiong.baoming.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitResponse {
    private boolean ok;
    private String id;
    private String token;
}
