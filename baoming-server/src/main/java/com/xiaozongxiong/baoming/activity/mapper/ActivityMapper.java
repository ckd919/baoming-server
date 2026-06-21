package com.xiaozongxiong.baoming.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaozongxiong.baoming.model.Activity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {

    @Update("UPDATE activities SET submission_count = submission_count + 1 WHERE id = #{id}")
    int incrementSubmissionCount(@Param("id") String id);

    @Update("UPDATE activities SET submission_count = submission_count - 1 WHERE id = #{id} AND submission_count > 0")
    int decrementSubmissionCount(@Param("id") String id);
}
