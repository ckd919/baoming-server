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

    // ---- Public form ----
    @GetMapping("/api/form/{activityId}")
    public ResponseEntity<?> getPublicForm(@PathVariable String activityId,
                                           @RequestParam(required = false, defaultValue = "") String token) {
        return ResponseEntity.ok(submissionService.getPublicForm(activityId, token));
    }

    @PostMapping("/api/form/{activityId}/submit")
    public ResponseEntity<?> submit(@PathVariable String activityId,
                                    @Valid @RequestBody SubmitRequest req) {
        return ResponseEntity.ok(submissionService.submit(activityId, req));
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
