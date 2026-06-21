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
@TableName("submissions")
public class Submission {
    @TableId(type = IdType.INPUT)
    private String id;

    @TableField("activity_id")
    private String activityId;

    @TableField("user_id")
    private Integer userId;

    private String phone;
    private String data;

    @TableField("submitted_at")
    private Long submittedAt;
}
