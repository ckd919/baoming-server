package com.xiaozongxiong.baoming.submission;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.activity.ActivityService;
import com.xiaozongxiong.baoming.activity.mapper.ActivityAdminMapper;
import com.xiaozongxiong.baoming.activity.mapper.ActivityMapper;
import com.xiaozongxiong.baoming.auth.mapper.UserMapper;
import com.xiaozongxiong.baoming.model.Activity;
import com.xiaozongxiong.baoming.model.ActivityAdmin;
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
    private final ActivityService activityService;
    private final ActivityAdminMapper activityAdminMapper;

    /** 获取公开表单（群限制时需登录，返回当前用户是否管理员） */
    public Map<String, Object> getPublicForm(String activityId, String token, Integer userId) {
        LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Activity::getId, activityId).eq(Activity::getStatus, "published");
        Activity activity = activityMapper.selectOne(wrapper);
        if (activity == null) throw new NoSuchElementException("活动不存在或未发布");

        if (Boolean.TRUE.equals(activity.getGroupRestricted())) {
            if (userId == null) {
                throw new SecurityException("此活动仅限群成员访问，请先登录");
            }
        }

        if (activity.getInviteToken() != null && !activity.getInviteToken().isEmpty()) {
            if (token == null || !token.equals(activity.getInviteToken())) {
                throw new SecurityException("报名链接无效，请联系群管理员获取正确链接");
            }
        }

        // 检查当前用户是否为管理员
        boolean isAdmin = false;
        if (userId != null) {
            LambdaQueryWrapper<ActivityAdmin> adminWrapper = new LambdaQueryWrapper<>();
            adminWrapper.eq(ActivityAdmin::getActivityId, activityId)
                        .eq(ActivityAdmin::getUserId, userId);
            isAdmin = activityAdminMapper.selectOne(adminWrapper) != null;
        }

        return Map.of("activity", buildPublicActivityMap(activity, isAdmin));
    }

    @Transactional
    public SubmitResponse submit(String activityId, SubmitRequest req, Integer userId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) throw new NoSuchElementException("活动不存在");
        if (!"published".equals(activity.getStatus())) throw new IllegalStateException("活动未开放报名");
        if (activity.getMaxParticipants() > 0 && activity.getSubmissionCount() >= activity.getMaxParticipants())
            throw new IllegalStateException("报名人数已满");

        if (activity.getInviteToken() != null && !activity.getInviteToken().isEmpty()) {
            if (req.getToken() == null || !req.getToken().equals(activity.getInviteToken()))
                throw new SecurityException("报名链接无效");
        }

        // 优先使用已登录用户，其次使用请求中的手机号
        User user = null;
        String phone = req.getPhone();
        if (userId != null) {
            user = userMapper.selectById(userId);
            if (user != null && (phone == null || phone.isEmpty())) {
                phone = user.getPhone();  // 自动获取已绑定手机号
            }
        }
        if (user == null && phone != null && !phone.isEmpty()) {
            LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.eq(User::getPhone, phone);
            user = userMapper.selectOne(userWrapper);
            if (user == null) {
                user = User.builder().phone(phone).role("USER")
                    .nickname("用户" + phone.substring(phone.length() - 4)).build();
                userMapper.insert(user);
            }
        }

        String dataJson;
        try { dataJson = req.getData() != null ? objectMapper.writeValueAsString(req.getData()) : "{}"; }
        catch (JsonProcessingException e) { dataJson = "{}"; }

        Submission submission = Submission.builder()
                .id(req.getId()).activityId(activityId)
                .userId(user != null ? user.getId() : null)
                .phone(phone).data(dataJson)
                .submittedAt(req.getSubmittedAt() != null ? req.getSubmittedAt() : System.currentTimeMillis()).build();
        submissionMapper.insert(submission);
        activityMapper.incrementSubmissionCount(activityId);

        String token = user != null ? jwtUtil.generateToken(user) : null;
        return SubmitResponse.builder().ok(true).id(req.getId()).token(token).build();
    }

    public Map<String, Object> getActivitySubmissions(String activityId, Integer userId) {
        if (!activityService.canManage(activityId, userId))
            throw new NoSuchElementException("活动不存在或无权限");

        List<Submission> submissions = submissionMapper.findByActivityId(activityId);
        List<Map<String, Object>> list = submissions.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId()); map.put("phone", s.getPhone());
            try { map.put("data", s.getData() != null ? objectMapper.readValue(s.getData(), Map.class) : Collections.emptyMap()); }
            catch (JsonProcessingException e) { map.put("data", Collections.emptyMap()); }
            map.put("submittedAt", s.getSubmittedAt());
            return map;
        }).collect(Collectors.toList());
        return Map.of("submissions", list);
    }

    @Transactional
    public Map<String, Object> clearActivitySubmissions(String activityId, Integer userId) {
        if (!activityService.canManage(activityId, userId))
            throw new NoSuchElementException("活动不存在或无权限");
        submissionMapper.deleteByActivityId(activityId);
        Activity activity = activityMapper.selectById(activityId);
        if (activity != null) { activity.setSubmissionCount(0); activityMapper.updateById(activity); }
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
        if (!"published".equals(act.getStatus())) throw new IllegalStateException("活动已结束");
        submissionMapper.deleteById(submissionId);
        activityMapper.decrementSubmissionCount(sub.getActivityId());
        return Map.of("ok", true);
    }

    private Map<String, Object> buildPublicActivityMap(Activity a, boolean isAdmin) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("userId", a.getUserId());
        map.put("name", a.getName());
        map.put("description", a.getDescription());
        map.put("location", a.getLocation());
        map.put("startTime", a.getStartTime());
        map.put("endTime", a.getEndTime());
        map.put("maxParticipants", a.getMaxParticipants());
        map.put("status", a.getStatus());
        try { map.put("fields", a.getFields() != null ? objectMapper.readValue(a.getFields(), List.class) : Collections.emptyList()); }
        catch (JsonProcessingException e) { map.put("fields", Collections.emptyList()); }
        map.put("submissionCount", a.getSubmissionCount());
        map.put("requireToken", a.getInviteToken() != null && !a.getInviteToken().isEmpty());
        map.put("wechatOnly", a.getWechatOnly());
        map.put("allowShare", a.getAllowShare());
        map.put("shareLevel", a.getShareLevel() != null ? a.getShareLevel() : (Boolean.FALSE.equals(a.getAllowShare()) ? "creator" : "all"));
        map.put("groupRestricted", a.getGroupRestricted());
        map.put("requireLogin", Boolean.TRUE.equals(a.getGroupRestricted()));
        map.put("isAdmin", isAdmin);
        return map;
    }
}
