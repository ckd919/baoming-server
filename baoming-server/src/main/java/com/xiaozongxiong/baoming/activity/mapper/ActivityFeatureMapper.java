package com.xiaozongxiong.baoming.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaozongxiong.baoming.model.*;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ActivityFeatureMapper {

    // ---- 留言 ----
    @Select("SELECT c.*, u.nickname, u.avatar_url FROM activity_comments c JOIN users u ON c.user_id = u.id WHERE c.activity_id = #{activityId} ORDER BY c.created_at DESC")
    @Results({
        @Result(property = "avatarUrl", column = "avatar_url"),
        @Result(property = "activityId", column = "activity_id"),
        @Result(property = "userId", column = "user_id"),
        @Result(property = "createdAt", column = "created_at")
    })
    List<ActivityComment> findCommentsByActivityId(String activityId);

    // ---- 取消申请 ----
    @Select("SELECT cr.*, u.nickname FROM cancel_requests cr JOIN users u ON cr.user_id = u.id WHERE cr.activity_id = #{activityId} AND cr.status = 'pending' ORDER BY cr.created_at DESC")
    @Results({
        @Result(property = "submissionId", column = "submission_id"),
        @Result(property = "activityId", column = "activity_id"),
        @Result(property = "userId", column = "user_id"),
        @Result(property = "reviewedBy", column = "reviewed_by"),
        @Result(property = "reviewedAt", column = "reviewed_at"),
        @Result(property = "createdAt", column = "created_at")
    })
    List<CancelRequest> findPendingRequests(String activityId);

    @Select("SELECT cr.* FROM cancel_requests cr WHERE cr.submission_id = #{submissionId} AND cr.status = 'pending'")
    @Results({
        @Result(property = "submissionId", column = "submission_id"),
        @Result(property = "activityId", column = "activity_id"),
        @Result(property = "userId", column = "user_id"),
        @Result(property = "reviewedBy", column = "reviewed_by"),
        @Result(property = "reviewedAt", column = "reviewed_at"),
        @Result(property = "createdAt", column = "created_at")
    })
    CancelRequest findPendingBySubmissionId(String submissionId);

    // ---- 管理员历史 ----
    @Select("SELECT ah.*, u.phone, u.nickname, u.avatar_url FROM admin_history ah JOIN users u ON ah.admin_id = u.id WHERE ah.owner_id = #{ownerId} ORDER BY ah.created_at DESC")
    @Results({
        @Result(property = "ownerId", column = "owner_id"),
        @Result(property = "adminId", column = "admin_id"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "avatarUrl", column = "avatar_url")
    })
    List<AdminHistory> findHistoryByOwner(Integer ownerId);

    @Insert("INSERT INTO admin_history (owner_id, admin_id, created_at) VALUES (#{ownerId}, #{adminId}, #{createdAt}) ON CONFLICT (owner_id, admin_id) DO UPDATE SET created_at = #{createdAt}")
    int upsertHistory(@Param("ownerId") Integer ownerId, @Param("adminId") Integer adminId, @Param("createdAt") Long createdAt);
}
