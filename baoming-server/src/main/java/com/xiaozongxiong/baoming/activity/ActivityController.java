package com.xiaozongxiong.baoming.activity;

import com.xiaozongxiong.baoming.activity.dto.ActivityCreateRequest;
import com.xiaozongxiong.baoming.activity.dto.ActivityUpdateRequest;
import com.xiaozongxiong.baoming.activity.dto.BatchExportRequest;
import com.xiaozongxiong.baoming.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal principal,
                                  @RequestParam(required = false) String status,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "50") int count) {
        return ResponseEntity.ok(activityService.listActivities(principal.getId(), status, keyword, page, count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("activity", activityService.getActivity(id, principal.getId())));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ActivityCreateRequest req,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.createActivity(req, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody ActivityUpdateRequest updates,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.updateActivity(id, updates, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.deleteActivity(id, principal.getId()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restore(@PathVariable String id,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.restoreActivity(id, principal.getId()));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> permanentDelete(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.permanentDeleteActivity(id, principal.getId()));
    }

    @PostMapping("/batch-export")
    public ResponseEntity<?> batchExport(@Valid @RequestBody BatchExportRequest req,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.batchExport(req.getIds(), principal.getId()));
    }

    @PostMapping("/{id}/regenerate-token")
    public ResponseEntity<?> regenerateToken(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(activityService.regenerateToken(id, principal.getId()));
    }
}
