package com.xiaozongxiong.baoming.activity;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.activity.dto.*;
import com.xiaozongxiong.baoming.activity.mapper.ActivityAdminMapper;
import com.xiaozongxiong.baoming.activity.mapper.ActivityMapper;
import com.xiaozongxiong.baoming.auth.mapper.UserMapper;
import com.xiaozongxiong.baoming.model.Activity;
import com.xiaozongxiong.baoming.model.ActivityAdmin;
import com.xiaozongxiong.baoming.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityMapper activityMapper;
    private final ActivityAdminMapper activityAdminMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;

    // ==================== 活动列表 ====================

    public Map<String, Object> listActivities(Integer userId, String status, String keyword, int pageNum, int count) {
        if (status == null || "all".equals(status)) status = null;
        if (keyword == null || keyword.isEmpty()) keyword = null;

        Page<Activity> page = new Page<>(pageNum, count);
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getUserId, userId)
               .ne(Activity::getStatus, "deleted")
               .eq(status != null, Activity::getStatus, status);

        if (keyword != null) {
            String kw = keyword;
            wrapper.and(w -> w.like(Activity::getName, kw));
        }
        wrapper.orderByDesc(Activity::getUpdatedAt);

        Page<Activity> result = activityMapper.selectPage(page, wrapper);
        List<ActivityResponse> activities = result.getRecords().stream()
                .map(ActivityResponse::from)
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("activities", activities);
        response.put("total", result.getTotal());
        response.put("page", pageNum);
        response.put("count", count);
        return response;
    }

    // ==================== 活动详情（创建者 + 管理员均可查看） ====================

    public ActivityResponse getActivity(String id, Integer userId) {
        Activity activity = findManaged(id, userId);
        return ActivityResponse.from(activity);
    }

    // ==================== 创建活动 ====================

    @Transactional
    public Map<String, Object> createActivity(ActivityCreateRequest req, Integer userId) {
        long now = System.currentTimeMillis();
        Activity activity = Activity.builder()
                .id(req.getId())
                .userId(userId)
                .name(req.getName())
                .description(req.getDescription() != null ? req.getDescription() : "")
                .location(req.getLocation() != null ? req.getLocation() : "")
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .maxParticipants(req.getMaxParticipants() != null ? req.getMaxParticipants() : 0)
                .status(req.getStatus() != null ? req.getStatus() : "draft")
                .fields(toJson(req.getFields()))
                .submissionCount(0)
                .allowShare(req.getAllowShare() != null ? req.getAllowShare() : true)
                .inviteToken(req.getInviteToken())
                .verifyCode("")
                .wechatOnly(req.getWechatOnly() != null ? req.getWechatOnly() : false)
                .shareLevel(req.getShareLevel() != null ? req.getShareLevel() : "all")
                .groupRestricted(req.getGroupRestricted() != null ? req.getGroupRestricted() : false)
                .allowedGroups(toJson(req.getAllowedGroups()))
                .createdAt(req.getCreatedAt() != null ? req.getCreatedAt() : now)
                .updatedAt(now)
                .build();
        activityMapper.insert(activity);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        result.put("id", req.getId());
        return result;
    }

    // ==================== 更新活动（仅创建者） ====================

    @Transactional
    public Map<String, Object> updateActivity(String id, ActivityUpdateRequest updates, Integer userId) {
        Activity activity = findOwned(id, userId);  // 仅创建者可编辑
        long now = System.currentTimeMillis();

        if (updates.getName() != null) activity.setName(updates.getName());
        if (updates.getDescription() != null) activity.setDescription(updates.getDescription());
        if (updates.getLocation() != null) activity.setLocation(updates.getLocation());
        if (updates.getStartTime() != null) activity.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null) activity.setEndTime(updates.getEndTime());
        if (updates.getMaxParticipants() != null) activity.setMaxParticipants(updates.getMaxParticipants());
        if (updates.getStatus() != null) activity.setStatus(updates.getStatus());
        if (updates.getSubmissionCount() != null) activity.setSubmissionCount(updates.getSubmissionCount());
        if (updates.getAllowShare() != null) activity.setAllowShare(updates.getAllowShare());
        if (updates.getInviteToken() != null) activity.setInviteToken(updates.getInviteToken());
        if (updates.getWechatOnly() != null) activity.setWechatOnly(updates.getWechatOnly());
        if (updates.getShareLevel() != null) activity.setShareLevel(updates.getShareLevel());
        if (updates.getGroupRestricted() != null) activity.setGroupRestricted(updates.getGroupRestricted());
        if (updates.getFields() != null) activity.setFields(toJson(updates.getFields()));
        if (updates.getAllowedGroups() != null) activity.setAllowedGroups(toJson(updates.getAllowedGroups()));
        activity.setUpdatedAt(now);

        activityMapper.updateById(activity);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        return result;
    }

    // ==================== 删除/恢复（仅创建者） ====================

    @Transactional
    public Map<String, Object> deleteActivity(String id, Integer userId) {
        long now = System.currentTimeMillis();
        LambdaUpdateWrapper<Activity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId)
               .set(Activity::getStatus, "deleted").set(Activity::getUpdatedAt, now);
        int updated = activityMapper.update(null, wrapper);
        if (updated == 0) throw new NoSuchElementException("活动不存在或无权限");
        return Map.of("ok", true);
    }

    @Transactional
    public Map<String, Object> restoreActivity(String id, Integer userId) {
        long now = System.currentTimeMillis();
        LambdaUpdateWrapper<Activity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId)
               .set(Activity::getStatus, "draft").set(Activity::getUpdatedAt, now);
        int updated = activityMapper.update(null, wrapper);
        if (updated == 0) throw new NoSuchElementException("活动不存在或无权限");
        return Map.of("ok", true);
    }

    @Transactional
    public Map<String, Object> permanentDeleteActivity(String id, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        int deleted = activityMapper.delete(wrapper);
        if (deleted == 0) throw new NoSuchElementException("活动不存在或无权限");
        return Map.of("ok", true);
    }

    // ==================== 导出 / Token ====================

    public Map<String, Object> batchExport(List<String> ids, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Activity::getId, ids).eq(Activity::getUserId, userId);
        List<Activity> acts = activityMapper.selectList(wrapper);
        List<Map<String, Object>> activityList = acts.stream().map(a -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getId());
            map.put("name", a.getName());
            map.put("submission_count", a.getSubmissionCount());
            map.put("submissions", Collections.emptyList());
            return map;
        }).collect(Collectors.toList());
        return Map.of("activities", activityList);
    }

    @Transactional
    public Map<String, Object> regenerateToken(String id, Integer userId) {
        findOwned(id, userId);
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        String newToken = bytesToHex(bytes);

        LambdaUpdateWrapper<Activity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId)
               .set(Activity::getInviteToken, newToken).set(Activity::getUpdatedAt, System.currentTimeMillis());
        activityMapper.update(null, wrapper);

        return Map.of("inviteToken", newToken);
    }

    // ==================== 复制活动 ====================

    @Transactional
    public Map<String, Object> duplicateActivity(String id, Integer userId) {
        Activity original = findManaged(id, userId);
        long now = System.currentTimeMillis();

        // 生成新ID
        String newId = Long.toString(now, 36) + Integer.toString(Math.abs(userId), 36).substring(0, 2);

        Activity copy = Activity.builder()
                .id(newId)
                .userId(userId)
                .name(original.getName() + "-副本")
                .description(original.getDescription())
                .location(original.getLocation())
                .startTime(original.getStartTime())
                .endTime(original.getEndTime())
                .maxParticipants(original.getMaxParticipants())
                .status("draft")                         // 复制后为草稿
                .fields(original.getFields())             // 复用表单字段
                .submissionCount(0)                       // 报名数归零
                .allowShare(original.getAllowShare())
                .inviteToken(null)                        // 新活动无邀请token
                .verifyCode("")
                .wechatOnly(original.getWechatOnly())
                .shareLevel(original.getShareLevel() != null ? original.getShareLevel() : "all")
                .groupRestricted(original.getGroupRestricted())
                .allowedGroups(original.getAllowedGroups())
                .createdAt(now)
                .updatedAt(now)
                .build();
        activityMapper.insert(copy);

        return Map.of("ok", true, "id", newId);
    }

    // ==================== 管理员管理 ====================

    /** 获取活动管理员列表（创建者 + 管理员均可查看） */
    public List<Map<String, Object>> listAdmins(String activityId, Integer userId) {
        Activity activity = findManaged(activityId, userId);

        List<Map<String, Object>> result = new ArrayList<>();

        // 先加创建者
        User owner = userMapper.selectById(activity.getUserId());
        if (owner != null) {
            Map<String, Object> ownerInfo = new LinkedHashMap<>();
            ownerInfo.put("userId", owner.getId());
            ownerInfo.put("phone", owner.getPhone());
            ownerInfo.put("nickname", owner.getNickname() != null ? owner.getNickname() : "");
            ownerInfo.put("avatarUrl", owner.getAvatarUrl() != null ? owner.getAvatarUrl() : "");
            ownerInfo.put("role", "owner");
            result.add(ownerInfo);
        }

        // 再加管理员
        List<ActivityAdmin> admins = activityAdminMapper.findByActivityId(activityId);
        admins.forEach(a -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("userId", a.getUserId());
            info.put("phone", a.getPhone() != null ? a.getPhone() : "");
            info.put("nickname", a.getNickname() != null ? a.getNickname() : "");
            info.put("avatarUrl", a.getAvatarUrl() != null ? a.getAvatarUrl() : "");
            info.put("role", a.getRole());
            result.add(info);
        });

        return result;
    }

    /** 添加管理员（仅创建者） */
    @Transactional
    public Map<String, Object> addAdmin(String activityId, String phone, Integer ownerUserId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        if (!activity.getUserId().equals(ownerUserId)) {
            throw new SecurityException("仅活动创建者可添加管理员");
        }

        // 根据手机号查找用户
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getPhone, phone);
        User targetUser = userMapper.selectOne(userWrapper);
        if (targetUser == null) {
            throw new IllegalArgumentException("该手机号未注册，请对方先登录小程序");
        }

        // 不能添加自己
        if (targetUser.getId().equals(ownerUserId)) {
            throw new IllegalArgumentException("不能将自己设为管理员（你已是创建者）");
        }

        // 检查是否已存在
        LambdaQueryWrapper<ActivityAdmin> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(ActivityAdmin::getActivityId, activityId)
                    .eq(ActivityAdmin::getUserId, targetUser.getId());
        if (activityAdminMapper.selectOne(existWrapper) != null) {
            throw new IllegalArgumentException("该用户已是管理员");
        }

        ActivityAdmin admin = ActivityAdmin.builder()
                .activityId(activityId)
                .userId(targetUser.getId())
                .role("admin")
                .createdAt(Instant.now().toEpochMilli())
                .build();
        activityAdminMapper.insert(admin);

        return Map.of("ok", true);
    }

    /** 移除管理员（仅创建者） */
    @Transactional
    public Map<String, Object> removeAdmin(String activityId, Integer targetUserId, Integer ownerUserId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        if (!activity.getUserId().equals(ownerUserId)) {
            throw new SecurityException("仅活动创建者可移除管理员");
        }

        int deleted = activityAdminMapper.deleteByActivityAndUser(activityId, targetUserId);
        if (deleted == 0) {
            throw new NoSuchElementException("该管理员不存在");
        }
        return Map.of("ok", true);
    }

    // ==================== 我管理的活动 ====================

    public List<Map<String, Object>> listManagedActivities(Integer userId) {
        Set<String> seenIds = new HashSet<>();
        List<Map<String, Object>> result = new ArrayList<>();

        // 创建者拥有的活动
        LambdaQueryWrapper<Activity> ownerWrapper = new LambdaQueryWrapper<>();
        ownerWrapper.eq(Activity::getUserId, userId)
                    .ne(Activity::getStatus, "deleted")
                    .orderByDesc(Activity::getUpdatedAt);
        List<Activity> owned = activityMapper.selectList(ownerWrapper);
        for (Activity a : owned) {
            Map<String, Object> map = activityToMap(a);
            map.put("role", "owner");
            result.add(map);
            seenIds.add(a.getId());
        }

        // 作为管理员的活动
        List<String> adminActivityIds = activityAdminMapper.findActivityIdsByAdminUserId(userId);
        if (adminActivityIds != null && !adminActivityIds.isEmpty()) {
            for (String aid : adminActivityIds) {
                if (seenIds.contains(aid)) continue;
                Activity a = activityMapper.selectById(aid);
                if (a != null && !"deleted".equals(a.getStatus())) {
                    Map<String, Object> map = activityToMap(a);
                    map.put("role", "admin");
                    result.add(map);
                    seenIds.add(aid);
                }
            }
        }

        return result;
    }

    // ==================== 权限辅助方法 ====================

    /** 查找活动：创建者或有权限的管理员 */
    private Activity findManaged(String id, Integer userId) {
        // 先检查是否为创建者
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity != null) return activity;

        // 再检查是否为被指定的管理员
        LambdaQueryWrapper<ActivityAdmin> adminWrapper = new LambdaQueryWrapper<>();
        adminWrapper.eq(ActivityAdmin::getActivityId, id)
                    .eq(ActivityAdmin::getUserId, userId);
        if (activityAdminMapper.selectOne(adminWrapper) != null) {
            activity = activityMapper.selectById(id);
            if (activity != null) return activity;
        }

        throw new NoSuchElementException("活动不存在或无权限访问");
    }

    /** 查找活动：严格创建者校验（编辑/删除等操作） */
    private Activity findOwned(String id, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity == null) throw new NoSuchElementException("活动不存在或无权限（仅创建者可操作）");
        return activity;
    }

    /** 判断用户是否有活动管理权限 */
    public boolean canManage(String activityId, Integer userId) {
        try {
            findManaged(activityId, userId);
            return true;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    // ==================== JSON 辅助 ====================

    private Map<String, Object> activityToMap(Activity a) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("name", a.getName());
        map.put("description", a.getDescription());
        map.put("location", a.getLocation());
        map.put("startTime", a.getStartTime());
        map.put("endTime", a.getEndTime());
        map.put("maxParticipants", a.getMaxParticipants());
        map.put("status", a.getStatus());
        map.put("submissionCount", a.getSubmissionCount());
        map.put("allowShare", a.getAllowShare());
        map.put("shareLevel", a.getShareLevel() != null ? a.getShareLevel() : "all");
        map.put("groupRestricted", a.getGroupRestricted());
        map.put("userId", a.getUserId());
        return map;
    }

    private String toJson(Object obj) {
        try {
            return obj == null ? "[]" : objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
