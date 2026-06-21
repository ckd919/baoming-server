package com.xiaozongxiong.baoming.template;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(templateService.listTemplates(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplate(id));
    }
}
