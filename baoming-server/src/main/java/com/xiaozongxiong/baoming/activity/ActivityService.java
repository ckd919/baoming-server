package com.xiaozongxiong.baoming.activity;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.activity.dto.*;
import com.xiaozongxiong.baoming.activity.mapper.ActivityMapper;
import com.xiaozongxiong.baoming.model.Activity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityMapper activityMapper;
    private final ObjectMapper objectMapper;

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

    public ActivityResponse getActivity(String id, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        return ActivityResponse.from(activity);
    }

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

    @Transactional
    public Map<String, Object> updateActivity(String id, ActivityUpdateRequest updates, Integer userId) {
        Activity activity = findOwned(id, userId);
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
        if (updates.getFields() != null) activity.setFields(toJson(updates.getFields()));
        if (updates.getAllowedGroups() != null) activity.setAllowedGroups(toJson(updates.getAllowedGroups()));
        activity.setUpdatedAt(now);

        activityMapper.updateById(activity);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        return result;
    }

    @Transactional
    public Map<String, Object> deleteActivity(String id, Integer userId) {
        long now = System.currentTimeMillis();
        LambdaUpdateWrapper<Activity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId)
               .set(Activity::getStatus, "deleted").set(Activity::getUpdatedAt, now);
        int updated = activityMapper.update(null, wrapper);
        if (updated == 0) throw new NoSuchElementException("活动不存在");
        return Map.of("ok", true);
    }

    @Transactional
    public Map<String, Object> restoreActivity(String id, Integer userId) {
        long now = System.currentTimeMillis();
        LambdaUpdateWrapper<Activity> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId)
               .set(Activity::getStatus, "draft").set(Activity::getUpdatedAt, now);
        int updated = activityMapper.update(null, wrapper);
        if (updated == 0) throw new NoSuchElementException("活动不存在");
        return Map.of("ok", true);
    }

    @Transactional
    public Map<String, Object> permanentDeleteActivity(String id, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        int deleted = activityMapper.delete(wrapper);
        if (deleted == 0) throw new NoSuchElementException("活动不存在");
        return Map.of("ok", true);
    }

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

    private Activity findOwned(String id, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, id).eq(Activity::getUserId, userId);
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        return activity;
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
