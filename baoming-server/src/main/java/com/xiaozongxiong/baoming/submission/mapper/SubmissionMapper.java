package com.xiaozongxiong.baoming.submission.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaozongxiong.baoming.model.Submission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SubmissionMapper extends BaseMapper<Submission> {

    @Select("SELECT * FROM submissions WHERE activity_id = #{activityId} ORDER BY submitted_at DESC")
    List<Submission> findByActivityId(@Param("activityId") String activityId);

    @Select("SELECT * FROM submissions WHERE user_id = #{userId} ORDER BY submitted_at DESC")
    List<Submission> findByUserId(@Param("userId") Integer userId);

    @Delete("DELETE FROM submissions WHERE activity_id = #{activityId}")
    int deleteByActivityId(@Param("activityId") String activityId);
}
