package com.xiaozongxiong.baoming.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaozongxiong.baoming.auth.dto.*;
import com.xiaozongxiong.baoming.auth.mapper.UserMapper;
import com.xiaozongxiong.baoming.model.User;
import com.xiaozongxiong.baoming.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.wechat.appid:}")
    private String wechatAppId;

    @Value("${app.wechat.secret:}")
    private String wechatSecret;

    // ==================== 管理员登录/注册 ====================

    @Transactional
    public LoginResponse adminLogin(AdminLoginRequest req) {
        User user = findUserByPhone(req.getPhone());
        if (!"ADMIN".equals(user.getRole())) {
            throw new SecurityException("该账号不是管理员");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new SecurityException("手机号或密码错误");
        }
        String token = jwtUtil.generateToken(user);
        return LoginResponse.from(user, token, false);
    }

    @Transactional
    public LoginResponse adminRegister(AdminRegisterRequest req) {
        log.info("管理员注册请求: phone={}, nickname={}", req.getPhone(), req.getNickname());

        User existing = findUserByPhone(req.getPhone());
        if (existing != null) {
            log.warn("注册失败: 手机号 {} 已被注册", req.getPhone());
            throw new IllegalStateException("该手机号已被注册");
        }

        User user = User.builder()
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("ADMIN")
                .nickname(req.getNickname() != null && !req.getNickname().isBlank()
                        ? req.getNickname()
                        : "管理员" + req.getPhone().substring(req.getPhone().length() - 4))
                .build();
        log.info("创建管理员用户: phone={}, nickname={}", user.getPhone(), user.getNickname());

        userMapper.insert(user);
        log.info("管理员用户已插入数据库: id={}", user.getId());

        String token = jwtUtil.generateToken(user);
        log.info("管理员 JWT 已生成: id={}, role={}", user.getId(), user.getRole());

        return LoginResponse.from(user, token, true);
    }

    // ==================== 用户手机号登录（保留兼容） ====================

    @Transactional
    public LoginResponse userPhoneLogin(UserPhoneLoginRequest req) {
        User user = findUserByPhone(req.getPhone());
        if (user == null) {
            user = User.builder()
                    .phone(req.getPhone())
                    .role("USER")
                    .nickname("用户" + req.getPhone().substring(req.getPhone().length() - 4))
                    .build();
            userMapper.insert(user);
            String token = jwtUtil.generateToken(user);
            return LoginResponse.from(user, token, true);
        }

        String token = jwtUtil.generateToken(user);
        return LoginResponse.from(user, token, false);
    }

    // ==================== 微信授权登录（不强制手机号） ====================

    @Transactional
    public LoginResponse wechatLogin(WechatLoginRequest req) {
        // 1. 用 code 换取 openid 和 session_key
        String openid;
        try {
            openid = exchangeCodeForOpenid(req.getCode());
        } catch (Exception e) {
            log.error("微信 code 换 openid 失败", e);
            throw new SecurityException("微信授权失败，请重试");
        }

        if (openid == null || openid.isEmpty()) {
            throw new SecurityException("无法获取微信身份信息");
        }

        // 2. 根据 openid 查找用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getOpenid, openid);
        User user = userMapper.selectOne(wrapper);

        boolean isNew = false;
        if (user == null) {
            // 新用户：openid 注册，无需手机号
            user = User.builder()
                    .openid(openid)
                    .phone(null)  // 手机号暂为空
                    .role("USER")
                    .nickname(req.getNickname() != null ? req.getNickname() : "微信用户")
                    .avatarUrl(req.getAvatarUrl() != null ? req.getAvatarUrl() : "")
                    .build();
            userMapper.insert(user);
            isNew = true;
            log.info("新微信用户注册: openid={}, id={}", openid, user.getId());
        } else {
            // 已有用户：更新昵称和头像
            if (req.getNickname() != null) user.setNickname(req.getNickname());
            if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
            userMapper.updateById(user);
        }

        String token = jwtUtil.generateToken(user);
        return LoginResponse.from(user, token, isNew);
    }

    // ==================== 绑定手机号（登录后可选） ====================

    @Transactional
    public LoginResponse bindPhone(Integer userId, BindPhoneRequest req) {
        // 1. 用 code 获取 session_key
        String sessionKey;
        try {
            sessionKey = exchangeForSessionKey(req.getCode());
        } catch (Exception e) {
            log.error("获取 session_key 失败", e);
            throw new SecurityException("微信授权失败，请重试");
        }

        // 2. 解密手机号
        String phone;
        try {
            phone = decryptPhone(req.getEncryptedData(), req.getIv(), sessionKey);
        } catch (Exception e) {
            log.error("解密手机号失败", e);
            throw new SecurityException("手机号解密失败，请重试");
        }

        if (phone == null || phone.isEmpty()) {
            throw new SecurityException("未能获取手机号");
        }

        // 3. 检查手机号是否已被其他用户绑定
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getPhone, phone);
        User exist = userMapper.selectOne(wrapper);
        if (exist != null && !exist.getId().equals(userId)) {
            throw new IllegalArgumentException("该手机号已被其他用户绑定");
        }

        // 4. 绑定到当前用户
        User user = userMapper.selectById(userId);
        if (user == null) throw new NoSuchElementException("用户不存在");
        user.setPhone(phone);
        userMapper.updateById(user);

        log.info("手机号绑定成功: userId={}, phone={}", userId, phone);
        return LoginResponse.from(user, null, false);
    }

    // ==================== 个人信息 ====================

    public LoginResponse getCurrentUser(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new NoSuchElementException("用户不存在");
        return LoginResponse.from(user, null, false);
    }

    @Transactional
    public LoginResponse updateProfile(Integer userId, UpdateProfileRequest req) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new NoSuchElementException("用户不存在");

        if (req.getNickname() != null) user.setNickname(req.getNickname());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());

        userMapper.updateById(user);
        return LoginResponse.from(user, null, false);
    }

    // ==================== 私有辅助方法 ====================

    private User findUserByPhone(String phone) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getPhone, phone);
        return userMapper.selectOne(wrapper);
    }

    /** 微信 code 换 openid */
    private String exchangeCodeForOpenid(String code) throws Exception {
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            wechatAppId, wechatSecret, code
        );
        ResponseEntity<String> resp = restTemplate.getForEntity(url, String.class);
        JsonNode node = objectMapper.readTree(resp.getBody());
        if (node.has("errcode") && node.get("errcode").asInt() != 0) {
            throw new SecurityException("微信接口错误: " + node.get("errmsg").asText());
        }
        return node.get("openid").asText();
    }

    /** 微信 code 换 session_key */
    private String exchangeForSessionKey(String code) throws Exception {
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            wechatAppId, wechatSecret, code
        );
        ResponseEntity<String> resp = restTemplate.getForEntity(url, String.class);
        JsonNode node = objectMapper.readTree(resp.getBody());
        if (node.has("errcode") && node.get("errcode").asInt() != 0) {
            throw new SecurityException("微信接口错误: " + node.get("errmsg").asText());
        }
        return node.get("session_key").asText();
    }

    /** 解密微信手机号数据 */
    private String decryptPhone(String encryptedData, String iv, String sessionKey) throws Exception {
        // Base64 解码 session_key
        byte[] keyBytes = Base64.getDecoder().decode(sessionKey);
        byte[] ivBytes = Base64.getDecoder().decode(iv);
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);

        // AES-128-CBC 解密
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] decrypted = cipher.doFinal(encryptedBytes);

        String json = new String(decrypted, StandardCharsets.UTF_8);
        JsonNode node = objectMapper.readTree(json);
        // 优先取 purePhoneNumber（无国家代码），否则取 phoneNumber
        if (node.has("purePhoneNumber")) {
            return node.get("purePhoneNumber").asText();
        }
        return node.get("phoneNumber").asText();
    }
}
