package com.xiaozongxiong.baoming.submission;

import com.xiaozongxiong.baoming.security.UserPrincipal;
import com.xiaozongxiong.baoming.submission.dto.SubmitRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    // ---- Public form (可选登录) ----
    @GetMapping("/api/form/{activityId}")
    public ResponseEntity<?> getPublicForm(@PathVariable String activityId,
                                           @RequestParam(required = false, defaultValue = "") String token,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        Integer userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(submissionService.getPublicForm(activityId, token, userId));
    }

    @PostMapping("/api/form/{activityId}/submit")
    public ResponseEntity<?> submit(@PathVariable String activityId,
                                    @Valid @RequestBody SubmitRequest req,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        Integer userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(submissionService.submit(activityId, req, userId));
    }

    // ---- Admin ----
    @GetMapping("/api/activities/{activityId}/submissions")
    public ResponseEntity<?> getSubmissions(@PathVariable String activityId,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(submissionService.getActivitySubmissions(activityId, principal.getId()));
    }

    @DeleteMapping("/api/activities/{activityId}/submissions")
    public ResponseEntity<?> clearSubmissions(@PathVariable String activityId,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(submissionService.clearActivitySubmissions(activityId, principal.getId()));
    }

    // ---- User self-service ----
    @GetMapping("/api/user/submissions")
    public ResponseEntity<?> getUserSubmissions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(submissionService.getUserSubmissions(principal.getId()));
    }

    @DeleteMapping("/api/submissions/{submissionId}/cancel")
    public ResponseEntity<?> cancelSubmission(@PathVariable String submissionId,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(submissionService.cancelSubmission(submissionId, principal.getId()));
    }
}
