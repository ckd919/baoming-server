package com.xiaozongxiong.baoming.submission;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.activity.mapper.ActivityMapper;
import com.xiaozongxiong.baoming.auth.mapper.UserMapper;
import com.xiaozongxiong.baoming.model.Activity;
import com.xiaozongxiong.baoming.model.Submission;
import com.xiaozongxiong.baoming.model.User;
import com.xiaozongxiong.baoming.security.JwtUtil;
import com.xiaozongxiong.baoming.submission.dto.SubmitRequest;
import com.xiaozongxiong.baoming.submission.dto.SubmitResponse;
import com.xiaozongxiong.baoming.submission.dto.SubmissionResponse;
import com.xiaozongxiong.baoming.submission.mapper.SubmissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionMapper submissionMapper;
    private final ActivityMapper activityMapper;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public Map<String, Object> getPublicForm(String activityId, String token) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, activityId).eq(Activity::getStatus, "published");
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity == null) throw new NoSuchElementException("活动不存在或未发布");

        if (activity.getInviteToken() != null && !activity.getInviteToken().isEmpty()) {
            if (token == null || !token.equals(activity.getInviteToken())) {
                throw new SecurityException("报名链接无效，请联系群管理员获取正确链接");
            }
        }

        return Map.of("activity", buildPublicActivityMap(activity));
    }

    @Transactional
    public SubmitResponse submit(String activityId, SubmitRequest req) {
        // 1. Validate activity
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        if (!"published".equals(activity.getStatus())) throw new IllegalStateException("活动未开放报名");
        if (activity.getMaxParticipants() > 0 && activity.getSubmissionCount() >= activity.getMaxParticipants())
            throw new IllegalStateException("报名人数已满");

        if (activity.getInviteToken() != null && !activity.getInviteToken().isEmpty()) {
            if (req.getToken() == null || !req.getToken().equals(activity.getInviteToken()))
                throw new SecurityException("报名链接无效，请联系群管理员获取正确链接");
        }

        // 2. Auto-login or create user
        LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(User::getPhone, req.getPhone());
        User user = userMapper.selectOne(userWrapper);
        if (user == null) {
            user = User.builder()
                    .phone(req.getPhone())
                    .role("USER")
                    .nickname("用户" + req.getPhone().substring(req.getPhone().length() - 4))
                    .build();
            userMapper.insert(user);
        }

        // 3. Create submission
        String dataJson;
        try {
            dataJson = req.getData() != null ? objectMapper.writeValueAsString(req.getData()) : "{}";
        } catch (JsonProcessingException e) {
            dataJson = "{}";
        }

        Submission submission = Submission.builder()
                .id(req.getId())
                .activityId(activityId)
                .userId(user.getId())
                .phone(req.getPhone())
                .data(dataJson)
                .submittedAt(req.getSubmittedAt() != null ? req.getSubmittedAt() : System.currentTimeMillis())
                .build();
        submissionMapper.insert(submission);

        // 4. Increment counter
        activityMapper.incrementSubmissionCount(activityId);

        // 5. Issue JWT for user
        String token = jwtUtil.generateToken(user);

        return SubmitResponse.builder().ok(true).id(req.getId()).token(token).build();
    }

    public Map<String, Object> getActivitySubmissions(String activityId, Integer userId) {
        LambdaQueryWrapper<Activity> actWrapper = new LambdaQueryWrapper<>();
        actWrapper.eq(Activity::getId, activityId).eq(Activity::getUserId, userId);
        if (activityMapper.selectOne(actWrapper) == null)
            throw new NoSuchElementException("活动不存在或无权限");

        List<Submission> submissions = submissionMapper.findByActivityId(activityId);
        List<Map<String, Object>> list = submissions.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("phone", s.getPhone());
            try {
                map.put("data", s.getData() != null ? objectMapper.readValue(s.getData(), Map.class) : Collections.emptyMap());
            } catch (JsonProcessingException e) {
                map.put("data", Collections.emptyMap());
            }
            map.put("submittedAt", s.getSubmittedAt());
            return map;
        }).collect(Collectors.toList());

        return Map.of("submissions", list);
    }

    @Transactional
    public Map<String, Object> clearActivitySubmissions(String activityId, Integer userId) {
        LambdaQueryWrapper<Activity> actWrapper = new LambdaQueryWrapper<>();
        actWrapper.eq(Activity::getId, activityId).eq(Activity::getUserId, userId);
        if (activityMapper.selectOne(actWrapper) == null)
            throw new NoSuchElementException("活动不存在或无权限");

        submissionMapper.deleteByActivityId(activityId);
        Activity activity = activityMapper.selectById(activityId);
        if (activity != null) {
            activity.setSubmissionCount(0);
            activityMapper.updateById(activity);
        }
        return Map.of("ok", true);
    }

    public Map<String, Object> getUserSubmissions(Integer userId) {
        List<Submission> submissions = submissionMapper.findByUserId(userId);
        List<SubmissionResponse> list = submissions.stream().map(s -> {
            Activity act = activityMapper.selectById(s.getActivityId());
            String name = act != null ? act.getName() : "(已删除)";
            boolean canCancel = act != null && "published".equals(act.getStatus());
            return SubmissionResponse.from(s, name, canCancel);
        }).collect(Collectors.toList());
        return Map.of("submissions", list);
    }

    @Transactional
    public Map<String, Object> cancelSubmission(String submissionId, Integer userId) {
        Submission sub = submissionMapper.selectById(submissionId);
        if (sub == null) throw new NoSuchElementException("报名记录不存在");
        if (!Objects.equals(sub.getUserId(), userId)) throw new SecurityException("无权操作");

        Activity act = activityMapper.selectById(sub.getActivityId());
        if (act == null) throw new NoSuchElementException("活动不存在");
        if (!"published".equals(act.getStatus())) throw new IllegalStateException("活动已结束，无法取消报名");

        submissionMapper.deleteById(submissionId);
        activityMapper.decrementSubmissionCount(sub.getActivityId());
        return Map.of("ok", true);
    }

    private Map<String, Object> buildPublicActivityMap(Activity a) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("name", a.getName());
        map.put("description", a.getDescription());
        map.put("location", a.getLocation());
        map.put("startTime", a.getStartTime());
        map.put("endTime", a.getEndTime());
        map.put("maxParticipants", a.getMaxParticipants());
        map.put("status", a.getStatus());
        try {
            map.put("fields", a.getFields() != null ? objectMapper.readValue(a.getFields(), List.class) : Collections.emptyList());
        } catch (JsonProcessingException e) {
            map.put("fields", Collections.emptyList());
        }
        map.put("submissionCount", a.getSubmissionCount());
        map.put("requireToken", a.getInviteToken() != null && !a.getInviteToken().isEmpty());
        map.put("wechatOnly", a.getWechatOnly());
        return map;
    }
}
