package com.xiaozongxiong.baoming.activity;

import com.xiaozongxiong.baoming.activity.dto.ActivityCreateRequest;
import com.xiaozongxiong.baoming.activity.dto.ActivityUpdateRequest;
import com.xiaozongxiong.baoming.activity.dto.AdminAddRequest;
import com.xiaozongxiong.baoming.activity.dto.BatchExportRequest;
import com.xiaozongxiong.baoming.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    // ==================== 活动 CRUD ====================

    @GetMapping("/activities")
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal principal,
                                  @RequestParam(required = false) String status,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "50") int count) {
        return ResponseEntity.ok(activityService.listActivities(principal.getId(), status, keyword, page, count));
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<?> get(@PathVariable String id,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("activity", activityService.getActivity(id, principal.getId())));
    }

    @PostMapping("/activities")
    public ResponseEntity<?> create(@Valid @RequestBody ActivityCreateRequest req,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.createActivity(req, principal.getId()));
    }

    @PutMapping("/activities/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody ActivityUpdateRequest updates,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.updateActivity(id, updates, principal.getId()));
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<?> delete(@PathVariable String id,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.deleteActivity(id, principal.getId()));
    }

    @PostMapping("/activities/{id}/restore")
    public ResponseEntity<?> restore(@PathVariable String id,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.restoreActivity(id, principal.getId()));
    }

    @DeleteMapping("/activities/{id}/permanent")
    public ResponseEntity<?> permanentDelete(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.permanentDeleteActivity(id, principal.getId()));
    }

    @PostMapping("/activities/batch-export")
    public ResponseEntity<?> batchExport(@Valid @RequestBody BatchExportRequest req,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.batchExport(req.getIds(), principal.getId()));
    }

    @PostMapping("/activities/{id}/regenerate-token")
    public ResponseEntity<?> regenerateToken(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.regenerateToken(id, principal.getId()));
    }

    @PostMapping("/activities/{id}/duplicate")
    public ResponseEntity<?> duplicate(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.duplicateActivity(id, principal.getId()));
    }

    // ==================== 管理员管理 ====================

    @GetMapping("/activities/{id}/admins")
    public ResponseEntity<?> listAdmins(@PathVariable String id,
                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("admins", activityService.listAdmins(id, principal.getId())));
    }

    @PostMapping("/activities/{id}/admins")
    public ResponseEntity<?> addAdmin(@PathVariable String id,
                                      @Valid @RequestBody AdminAddRequest req,
                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.addAdmin(id, req.getPhone(), principal.getId()));
    }

    @DeleteMapping("/activities/{id}/admins/{userId}")
    public ResponseEntity<?> removeAdmin(@PathVariable String id,
                                         @PathVariable Integer userId,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.removeAdmin(id, userId, principal.getId()));
    }

    // ==================== 用户记录 ====================

    @GetMapping("/user/managed-activities")
    public ResponseEntity<?> getManagedActivities(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("activities", activityService.listManagedActivities(principal.getId())));
    }
}
