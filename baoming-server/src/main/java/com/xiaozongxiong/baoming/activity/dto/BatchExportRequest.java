package com.xiaozongxiong.baoming.activity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BatchExportRequest {
    @NotEmpty(message = "请选择要导出的活动")
    private List<String> ids;
}
