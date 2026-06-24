package com.xiaozongxiong.baoming.submission;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.activity.mapper.ActivityMapper;
import com.xiaozongxiong.baoming.model.Activity;
import com.xiaozongxiong.baoming.model.Submission;
import com.xiaozongxiong.baoming.model.User;
import com.xiaozongxiong.baoming.submission.mapper.SubmissionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final SubmissionMapper submissionMapper;
    private final ActivityMapper activityMapper;
    private final ObjectMapper objectMapper;

    @Value("${app.wechat.pay.merchant-id:}")
    private String merchantId;

    @Value("${app.wechat.pay.api-key:}")
    private String apiKey;

    @Value("${app.wechat.pay.mch-serial:}")
    private String mchSerial;

    @Value("${app.wechat.pay.notify-url:https://ledbell.cn/api/payments/notify}")
    private String notifyUrl;

    /** 创建预支付订单，返回小程序调起支付参数 */
    @Transactional
    public Map<String, Object> createPrepayOrder(Integer userId, String activityId, String submissionId, int amount) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) throw new RuntimeException("活动不存在");

        // 金额为0或未配置商户，跳过支付
        if (amount <= 0 || merchantId.isEmpty()) {
            Submission sub = submissionMapper.selectById(submissionId);
            if (sub != null) {
                sub.setPaid(true);
                sub.setAmount(0);
                submissionMapper.updateById(sub);
            }
            return Map.of("skipPay", true, "message", "无需支付");
        }

        // 更新提交记录金额
        Submission sub = submissionMapper.selectById(submissionId);
        if (sub != null) {
            sub.setAmount(amount);
            submissionMapper.updateById(sub);
        }

        String outTradeNo = "BAO" + System.currentTimeMillis() + randomStr(6);

        // 构建微信支付 JSAPI 下单参数
        Map<String, Object> orderBody = new LinkedHashMap<>();
        orderBody.put("appid", "wxa0606d69df5b21f0");
        orderBody.put("mchid", merchantId);
        orderBody.put("description", "报名费用-" + (activity.getName() != null ? activity.getName() : "活动"));
        orderBody.put("out_trade_no", outTradeNo);
        orderBody.put("notify_url", notifyUrl);

        Map<String, Object> amountObj = new LinkedHashMap<>();
        amountObj.put("total", amount);
        amountObj.put("currency", "CNY");
        orderBody.put("amount", amountObj);

        Map<String, Object> payer = new LinkedHashMap<>();
        payer.put("openid", getOpenid(userId));
        orderBody.put("payer", payer);

        // 商户未配置时返回模拟数据
        if (merchantId.isEmpty()) {
            return Map.of("skipPay", true, "outTradeNo", outTradeNo, "message", "测试模式");
        }

        // TODO: 调用微信支付 API https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi
        // String prepayId = callWechatPayApi(orderBody);

        // 返回小程序调起支付参数
        String prepayId = "mock_prepay_" + outTradeNo;
        String timeStamp = String.valueOf(System.currentTimeMillis() / 1000);
        String nonceStr = randomStr(32);
        String packageStr = "prepay_id=" + prepayId;

        String signStr = buildSign(merchantId + "\n" + timeStamp + "\n" + nonceStr + "\n" + packageStr + "\n");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("timeStamp", timeStamp);
        result.put("nonceStr", nonceStr);
        result.put("package", packageStr);
        result.put("signType", "RSA");
        result.put("paySign", signStr);
        result.put("outTradeNo", outTradeNo);
        return result;
    }

    /** 处理微信支付回调 */
    @Transactional
    public void handlePaymentNotify(String body, String signature, String timestamp, String nonce, String serial) {
        log.info("收到支付回调: {}", body);
        try {
            JsonNode node = objectMapper.readTree(body);
            String outTradeNo = node.get("out_trade_no").asText();
            String transactionId = node.get("transaction_id") != null ? node.get("transaction_id").asText() : "";
            String tradeState = node.get("trade_state").asText();

            if ("SUCCESS".equals(tradeState)) {
                // 查找到对应提交记录（通过 outTradeNo 匹配）
                // 简化：遍历查询
                List<Submission> all = submissionMapper.selectList(null);
                for (Submission s : all) {
                    if (s.getAmount() != null && s.getAmount() > 0 && !Boolean.TRUE.equals(s.getPaid())) {
                        s.setPaid(true);
                        s.setWxTransactionId(transactionId);
                        submissionMapper.updateById(s);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("处理支付回调失败", e);
        }
    }

    /** 查询支付状态 */
    public Map<String, Object> getPaymentStatus(String submissionId) {
        Submission sub = submissionMapper.selectById(submissionId);
        if (sub == null) throw new RuntimeException("记录不存在");
        return Map.of(
            "paid", sub.getPaid() != null && sub.getPaid(),
            "amount", sub.getAmount() != null ? sub.getAmount() : 0
        );
    }

    // ---- 辅助方法 ----

    private String getOpenid(Integer userId) {
        return ""; // 需从 User 表查
    }

    private String buildSign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec spec = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(spec);
            return Base64.getEncoder().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            return "";
        }
    }

    private String randomStr(int len) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        SecureRandom r = new SecureRandom();
        for (int i = 0; i < len; i++) sb.append(chars.charAt(r.nextInt(chars.length())));
        return sb.toString();
    }
}
