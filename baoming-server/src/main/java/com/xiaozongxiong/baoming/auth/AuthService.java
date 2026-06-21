package com.xiaozongxiong.baoming.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xiaozongxiong.baoming.auth.dto.AdminLoginRequest;
import com.xiaozongxiong.baoming.auth.dto.LoginResponse;
import com.xiaozongxiong.baoming.auth.dto.UserPhoneLoginRequest;
import com.xiaozongxiong.baoming.auth.mapper.UserMapper;
import com.xiaozongxiong.baoming.model.User;
import com.xiaozongxiong.baoming.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

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
    public LoginResponse userPhoneLogin(UserPhoneLoginRequest req) {
        User user = findUserByPhone(req.getPhone());
        if (user == null) {
            // Auto-create user with USER role (no password)
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

    public LoginResponse getCurrentUser(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new NoSuchElementException("用户不存在");
        return LoginResponse.from(user, null, false);
    }

    private User findUserByPhone(String phone) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getPhone, phone);
        return userMapper.selectOne(wrapper);
    }
}
