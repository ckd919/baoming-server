package com.xiaozongxiong.baoming.submission;

import com.xiaozongxiong.baoming.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    /** 创建预支付订单 */
    @PostMapping("/prepay")
    public ResponseEntity<?> prepay(@RequestBody Map<String, Object> body,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        String activityId = (String) body.get("activityId");
        int amount = Integer.parseInt(body.get("amount").toString());
        String submissionId = (String) body.get("submissionId");
        Map<String, Object> result = paymentService.createPrepayOrder(
            principal.getId(), activityId, submissionId, amount
        );
        return ResponseEntity.ok(result);
    }

    /** 支付结果通知（微信回调） */
    @PostMapping("/notify")
    public ResponseEntity<?> notify(@RequestBody String body,
                                    @RequestHeader("Wechatpay-Serial") String serial,
                                    @RequestHeader("Wechatpay-Signature") String signature,
                                    @RequestHeader("Wechatpay-Timestamp") String timestamp,
                                    @RequestHeader("Wechatpay-Nonce") String nonce) {
        paymentService.handlePaymentNotify(body, signature, timestamp, nonce, serial);
        return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "OK"));
    }

    /** 查询支付状态 */
    @GetMapping("/status/{submissionId}")
    public ResponseEntity<?> status(@PathVariable String submissionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(submissionId));
    }
}
