package com.xiaozongxiong.baoming.activity;

import com.xiaozongxiong.baoming.activity.mapper.*;
import com.xiaozongxiong.baoming.model.*;
import com.xiaozongxiong.baoming.security.UserPrincipal;
import com.xiaozongxiong.baoming.submission.mapper.SubmissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeatureController {
    private final ActivityFeatureMapper featureMapper;
    private final ActivityAdminMapper adminMapper;
    private final CommentMapper commentMapper;
    private final CancelRequestMapper cancelRequestMapper;
    private final SubmissionMapper submissionMapper;
    private final ActivityMapper activityMapper;

    // ==================== 留言 ====================

    @GetMapping("/activities/{id}/comments")
    public ResponseEntity<?> listComments(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("comments", featureMapper.findCommentsByActivityId(id)));
    }

    @PostMapping("/activities/{id}/comments")
    @Transactional
    public ResponseEntity<?> addComment(@PathVariable String id,
                                        @RequestBody Map<String, String> body,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        ActivityComment c = ActivityComment.builder()
            .activityId(id).userId(principal.getId())
            .content(body.get("content")).createdAt(System.currentTimeMillis()).build();
        commentMapper.insert(c);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ==================== 取消申请 ====================

    @PostMapping("/submissions/{submissionId}/request-cancel")
    @Transactional
    public ResponseEntity<?> requestCancel(@PathVariable String submissionId,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        Submission sub = submissionMapper.selectById(submissionId);
        if (sub == null) throw new RuntimeException("报名记录不存在");

        CancelRequest exist = featureMapper.findPendingBySubmissionId(submissionId);
        if (exist != null) throw new RuntimeException("已有待处理的取消申请");

        CancelRequest cr = CancelRequest.builder()
            .submissionId(submissionId).activityId(sub.getActivityId())
            .userId(principal.getId()).reason(body.getOrDefault("reason", ""))
            .status("pending").createdAt(System.currentTimeMillis()).build();
        cancelRequestMapper.insert(cr);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/activities/{id}/cancel-requests")
    public ResponseEntity<?> listCancelRequests(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("requests", featureMapper.findPendingRequests(id)));
    }

    @PostMapping("/cancel-requests/{requestId}/review")
    @Transactional
    public ResponseEntity<?> reviewCancel(@PathVariable Integer requestId,
                                          @RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        CancelRequest cr = cancelRequestMapper.selectById(requestId);
        if (cr == null) throw new RuntimeException("申请不存在");
        String action = body.get("action");
        cr.setStatus(action.equals("approve") ? "approved" : "rejected");
        cr.setReviewedBy(principal.getId());
        cr.setReviewedAt(System.currentTimeMillis());
        cancelRequestMapper.updateById(cr);

        if ("approve".equals(action)) {
            Submission sub = submissionMapper.selectById(cr.getSubmissionId());
            if (sub != null) {
                submissionMapper.deleteById(cr.getSubmissionId());
                activityMapper.decrementSubmissionCount(sub.getActivityId());
            }
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ==================== 管理员历史 ====================

    @GetMapping("/user/admin-history")
    public ResponseEntity<?> getAdminHistory(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("history", featureMapper.findHistoryByOwner(principal.getId())));
    }
}
