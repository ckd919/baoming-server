package com.xiaozongxiong.baoming.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaozongxiong.baoming.model.ActivityAdmin;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ActivityAdminMapper extends BaseMapper<ActivityAdmin> {

    @Select("""
        SELECT aa.*, u.phone, u.nickname, u.avatar_url
        FROM activity_admins aa
        JOIN users u ON aa.user_id = u.id
        WHERE aa.activity_id = #{activityId}
        ORDER BY aa.created_at
    """)
    @Results({
        @Result(property = "userId", column = "user_id"),
        @Result(property = "activityId", column = "activity_id"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "avatarUrl", column = "avatar_url"),
    })
    List<ActivityAdmin> findByActivityId(@Param("activityId") String activityId);

    @Select("SELECT aa.activity_id FROM activity_admins aa WHERE aa.user_id = #{userId}")
    List<String> findActivityIdsByAdminUserId(@Param("userId") Integer userId);

    @Delete("DELETE FROM activity_admins WHERE activity_id = #{activityId} AND user_id = #{userId}")
    int deleteByActivityAndUser(@Param("activityId") String activityId, @Param("userId") Integer userId);
}
