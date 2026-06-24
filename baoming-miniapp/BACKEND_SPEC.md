# 后端改动规范 — 康康个人工具 小程序 3.0

> **目标**: 配合小程序 3.0 版本的三标签重构，后端需要新增管理员管理、分享权限等级、用户记录等接口。
>
> **重要变更**: 登录改为**微信授权登录（不强制手机号）**，手机号改为登录后可选绑定。
>
> **后端项目位置**: `D:\claudeCode\baoming\baoming-server\`
>
> **技术栈**: Java Spring Boot 3 + MyBatis-Plus + PostgreSQL + JWT

---

## 一、数据库迁移 (Migration)

创建文件: `baoming-server/src/main/resources/db/migration/V2__admin_management.sql`

```sql
-- =============================================
-- V2: 管理员管理 + 分享权限等级 + 用户头像
-- =============================================

-- 1. 新增 share_level 字段（替代/增强 allow_share）
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS share_level VARCHAR(20) DEFAULT 'all';

-- 迁移现有数据：allow_share=false -> share_level='creator'
UPDATE activities 
SET share_level = 'creator' 
WHERE allow_share = false AND (share_level IS NULL OR share_level = 'all');

-- 2. 用户表新增头像字段 + 手机号改为可选
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(100) DEFAULT '';
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;  -- 手机号改为可选

CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

-- 3. 创建活动管理员关联表
CREATE TABLE IF NOT EXISTS activity_admins (
    id          SERIAL PRIMARY KEY,
    activity_id VARCHAR(20) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) DEFAULT 'admin',   -- 'admin' 或 'viewer'(预留)
    created_at  BIGINT NOT NULL DEFAULT 0,
    UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_aa_activity ON activity_admins(activity_id);
CREATE INDEX IF NOT EXISTS idx_aa_user ON activity_admins(user_id);
```

---

## 二、新增 Model

### 2.1 ActivityAdmin 实体

新建: `baoming-server/src/main/java/com/xiaozongxiong/baoming/activity/ActivityAdmin.java`

```java
package com.xiaozongxiong.baoming.activity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@TableName("activity_admins")
public class ActivityAdmin {
    @TableId(type = IdType.AUTO)
    private Integer id;

    @TableField("activity_id")
    private String activityId;

    @TableField("user_id")
    private Integer userId;

    private String role;

    @TableField("created_at")
    private Long createdAt;

    // 以下字段为 JOIN 查询时填充，非数据库字段
    @TableField(exist = false)
    private String phone;

    @TableField(exist = false)
    private String nickname;

    @TableField(exist = false)
    private String avatarUrl;
}
```

### 2.2 Activity 实体修改

在 `Activity.java` 中新增字段:

```java
/** 分享权限等级: all(所有人) / admins(管理员) / creator(仅创建者) */
@TableField("share_level")
private String shareLevel;
```

### 2.3 ActivityResponse DTO 修改

在 `ActivityResponse.java` 中新增:

```java
private String shareLevel;          // 分享权限等级
private List<AdminInfo> admins;     // 管理员列表（仅在需要时填充）

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public static class AdminInfo {
    private Integer userId;
    private String phone;
    private String nickname;
    private String avatarUrl;
    private String role;  // 'owner' | 'admin'
}
```

### 2.4 请求 DTO

**WechatLoginRequest** (修改 — 不再需要手机号):
```java
package com.xiaozongxiong.baoming.auth;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class WechatLoginRequest {
    @NotBlank(message = "code不能为空")
    private String code;          // wx.login 返回的临时 code
    private String nickname;      // 可选：微信昵称
    private String avatarUrl;     // 可选：微信头像
}
```

**BindPhoneRequest** (新建):
```java
package com.xiaozongxiong.baoming.auth;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class BindPhoneRequest {
    @NotBlank(message = "code不能为空")
    private String code;
    @NotBlank(message = "encryptedData不能为空")
    private String encryptedData;
    @NotBlank(message = "iv不能为空")
    private String iv;
}
```

**AdminAddRequest** (新建):
```java
package com.xiaozongxiong.baoming.activity;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class AdminAddRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;
}
```

**UpdateProfileRequest** (新建):
```java
package com.xiaozongxiong.baoming.auth;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private String avatarUrl;
}
```

---

## 三、新增 Mapper

新建: `baoming-server/src/main/java/com/xiaozongxiong/baoming/activity/ActivityAdminMapper.java`

```java
package com.xiaozongxiong.baoming.activity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ActivityAdminMapper extends BaseMapper<ActivityAdmin> {

    /** 查询活动的所有管理员（关联用户信息） */
    @Select("""
        SELECT aa.*, u.phone, u.nickname, u.avatar_url
        FROM activity_admins aa
        JOIN users u ON aa.user_id = u.id
        WHERE aa.activity_id = #{activityId}
        ORDER BY aa.created_at
    """)
    @Results({
        @Result(property = "userId", column = "user_id"),
        @Result(property = "activityId", column = "activity_id"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "avatarUrl", column = "avatar_url"),
    })
    List<ActivityAdmin> findByActivityId(@Param("activityId") String activityId);

    /** 查询用户作为管理员的所有活动 */
    @Select("""
        SELECT aa.activity_id
        FROM activity_admins aa
        WHERE aa.user_id = #{userId}
    """)
    List<String> findActivityIdsByAdminUserId(@Param("userId") Integer userId);

    /** 删除指定活动的指定管理员 */
    @Delete("DELETE FROM activity_admins WHERE activity_id = #{activityId} AND user_id = #{userId}")
    int deleteByActivityAndUser(@Param("activityId") String activityId, @Param("userId") Integer userId);
}
```

---

## 四、新增/修改 Service 层

### 4.1 ActivityService 修改

文件: `baoming-server/src/main/java/com/xiaozongxiong/baoming/activity/ActivityService.java`

#### 4.1.1 新增注入

```java
@Autowired
private ActivityAdminMapper activityAdminMapper;
```

#### 4.1.2 核心方法：findManaged（替换原有 findOwned）

将原来的 `findOwned()` 方法改为 `findManaged()`，支持创建者和管理员均可查看/操作：

```java
/**
 * 查找当前用户有权限访问的活动（创建者 或 被设为管理员）
 */
private Activity findManaged(String activityId, Integer userId) {
    // 先检查是否为创建者
    LambdaQueryWrapper<Activity> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Activity::getId, activityId)
           .eq(Activity::getUserId, userId);
    Activity activity = activityMapper.selectOne(wrapper);
    if (activity != null) {
        return activity;
    }

    // 再检查是否为被指定的管理员
    LambdaQueryWrapper<ActivityAdmin> adminWrapper = new LambdaQueryWrapper<>();
    adminWrapper.eq(ActivityAdmin::getActivityId, activityId)
                .eq(ActivityAdmin::getUserId, userId);
    if (activityAdminMapper.selectOne(adminWrapper) != null) {
        return activityMapper.selectById(activityId);
    }

    throw new NoSuchElementException("活动不存在或无权限访问");
}
```

**需要将 findOwned 替换为 findManaged 的方法**:
- `getActivity(String id, Integer userId)` — 查看活动
- `getActivitySubmissions(String activityId, Integer userId)` — 查看提交数据
- `clearActivitySubmissions(String activityId, Integer userId)` — 清空提交数据

**保持严格创建者校验的方法（管理员不可操作）**:
- `updateActivity(String id, ActivityUpdateRequest req, Integer userId)` — 编辑活动
- `deleteActivity(String id, Integer userId)` — 删除活动
- `restoreActivity(String id, Integer userId)` — 恢复活动
- `permanentDeleteActivity(String id, Integer userId)` — 永久删除
- `addAdmin(...)` — 添加管理员
- `removeAdmin(...)` — 移除管理员

#### 4.1.3 新增方法

```java
// ==================== 管理员管理 ====================

public List<ActivityAdmin> listAdmins(String activityId, Integer userId) {
    // 创建者和管理员都可以查看管理员列表
    findManaged(activityId, userId);
    return activityAdminMapper.findByActivityId(activityId);
}

public ActivityAdmin addAdmin(String activityId, String phone, Integer ownerUserId) {
    // 仅创建者可添加管理员
    Activity activity = activityMapper.selectById(activityId);
    if (activity == null) throw new NoSuchElementException("活动不存在");
    if (!activity.getUserId().equals(ownerUserId)) {
        throw new AccessDeniedException("仅活动创建者可添加管理员");
    }

    // 根据手机号查找用户
    LambdaQueryWrapper<User> userWrapper = new LambdaQueryWrapper<>();
    userWrapper.eq(User::getPhone, phone);
    User targetUser = userMapper.selectOne(userWrapper);
    if (targetUser == null) {
        throw new IllegalArgumentException("该手机号未注册，请对方先登录小程序");
    }

    // 不能添加自己
    if (targetUser.getId().equals(ownerUserId)) {
        throw new IllegalArgumentException("不能将自己设为管理员（你已是创建者）");
    }

    // 检查是否已存在
    LambdaQueryWrapper<ActivityAdmin> existWrapper = new LambdaQueryWrapper<>();
    existWrapper.eq(ActivityAdmin::getActivityId, activityId)
                .eq(ActivityAdmin::getUserId, targetUser.getId());
    if (activityAdminMapper.selectOne(existWrapper) != null) {
        throw new IllegalArgumentException("该用户已是管理员");
    }

    ActivityAdmin admin = ActivityAdmin.builder()
        .activityId(activityId)
        .userId(targetUser.getId())
        .role("admin")
        .createdAt(Instant.now().toEpochMilli())
        .build();
    activityAdminMapper.insert(admin);
    return admin;
}

public void removeAdmin(String activityId, Integer targetUserId, Integer ownerUserId) {
    // 仅创建者可移除管理员
    Activity activity = activityMapper.selectById(activityId);
    if (activity == null) throw new NoSuchElementException("活动不存在");
    if (!activity.getUserId().equals(ownerUserId)) {
        throw new AccessDeniedException("仅活动创建者可移除管理员");
    }

    int deleted = activityAdminMapper.deleteByActivityAndUser(activityId, targetUserId);
    if (deleted == 0) {
        throw new NoSuchElementException("该管理员不存在");
    }
}

// ==================== 用户记录 ====================

public List<Activity> listManagedActivities(Integer userId) {
    // 创建者拥有的活动
    LambdaQueryWrapper<Activity> ownerWrapper = new LambdaQueryWrapper<>();
    ownerWrapper.eq(Activity::getUserId, userId)
                .ne(Activity::getStatus, "deleted")
                .orderByDesc(Activity::getCreatedAt);
    List<Activity> owned = activityMapper.selectList(ownerWrapper);
    owned.forEach(a -> a.setExtra("role", "owner"));

    // 作为管理员的活动
    List<String> adminActivityIds = activityAdminMapper.findActivityIdsByAdminUserId(userId);
    if (!adminActivityIds.isEmpty()) {
        List<Activity> adminActivities = activityMapper.selectBatchIds(adminActivityIds)
            .stream()
            .filter(a -> !"deleted".equals(a.getStatus()))
            .toList();
        adminActivities.forEach(a -> a.setExtra("role", "admin"));

        // 合并，去重（理论上不会重复，因为创建者不会添加自己）
        Set<String> seenIds = new HashSet<>();
        List<Activity> merged = new ArrayList<>();
        for (Activity a : owned) { if (seenIds.add(a.getId())) merged.add(a); }
        for (Activity a : adminActivities) { if (seenIds.add(a.getId())) merged.add(a); }
        return merged;
    }

    return owned;
}
```

### 4.2 AuthService 修改

文件: `baoming-server/src/main/java/com/xiaozongxiong/baoming/auth/AuthService.java`

新增/修改方法:

```java
/**
 * 微信授权登录 — 不强制手机号
 * 通过 code 换取 openid，用 openid 识别用户
 * 手机号可在登录后通过 bindPhone 绑定
 */
public AuthResponse wechatLogin(WechatLoginRequest req) {
    // 1. 使用 code 获取 session_key 和 openid
    //    调用微信 API: https://api.weixin.qq.com/sns/jscode2session
    //    参数: appid, secret, js_code=req.code, grant_type=authorization_code
    //    返回: { openid, session_key, unionid(可选) }
    String openid = ... ; // 从微信API获取

    // 2. 根据 openid 查找用户
    User user = userMapper.selectOne(
        new LambdaQueryWrapper<User>().eq(User::getOpenid, openid)
    );

    if (user == null) {
        // 新用户：openid 注册，无需手机号
        user = User.builder()
            .openid(openid)
            .phone(null)                                          // 手机号为空
            .nickname(req.getNickname() != null ? req.getNickname() : "微信用户")
            .avatarUrl(req.getAvatarUrl() != null ? req.getAvatarUrl() : "")
            .role("USER")
            .createdAt(Instant.now().toEpochMilli())
            .build();
        userMapper.insert(user);
    } else {
        // 已有用户：更新昵称和头像
        if (req.getNickname() != null) user.setNickname(req.getNickname());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        userMapper.updateById(user);
    }

    // 3. 生成 JWT (userId + role，phone 可能为 null)
    String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getRole());
    return new AuthResponse(token, toUserResponse(user));
}

/**
 * 绑定手机号 — 登录后可选操作
 * 使用微信 getPhoneNumber 的加密数据解密手机号并绑定到当前用户
 */
public UserResponse bindPhone(Integer userId, BindPhoneRequest req) {
    // 1. 使用 req.code 获取 session_key
    //    调用微信 API: https://api.weixin.qq.com/sns/jscode2session
    String sessionKey = ... ;

    // 2. 使用 session_key 解密 encryptedData 获取手机号
    //    解密算法: AES-128-CBC, iv=req.iv, key=session_key(Base64)
    //    解密后 JSON: { phoneNumber, purePhoneNumber, countryCode, watermark }
    String phone = decryptedPhoneNumber;

    // 3. 检查手机号是否已被其他用户绑定
    User exist = userMapper.selectOne(
        new LambdaQueryWrapper<User>().eq(User::getPhone, phone)
    );
    if (exist != null && !exist.getId().equals(userId)) {
        throw new IllegalArgumentException("该手机号已被其他用户绑定");
    }

    // 4. 绑定到当前用户
    User user = userMapper.selectById(userId);
    user.setPhone(phone);
    userMapper.updateById(user);

    return toUserResponse(user);
}

/**
 * 更新个人信息（昵称、头像）
 */
public UserResponse updateProfile(Integer userId, UpdateProfileRequest req) {
    User user = userMapper.selectById(userId);
    if (user == null) throw new NoSuchElementException("用户不存在");

    if (req.getNickname() != null) user.setNickname(req.getNickname());
    if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());

    userMapper.updateById(user);
    return toUserResponse(user);
}
```

### 4.3 SubmissionService 修改

新增方法（供用户查看"我参与的"列表）:

```java
/**
 * 获取用户参与的活动列表（带活动名称）
 * 注意：现有 getUserSubmissions 可能已存在，检查并确认包含 activityName 和 canCancel 字段
 */
public List<SubmissionResponse> getUserSubmissions(Integer userId) {
    // 返回该用户的所有提交记录
    // 每个记录需包含: submissionId, activityId, activityName, submittedAt, data, canCancel
    // canCancel 逻辑: 活动状态为 'published' 时可取消
}
```

---

## 五、新增/修改 Controller 层

### 5.1 ActivityController 新增接口

文件: `baoming-server/src/main/java/com/xiaozongxiong/baoming/activity/ActivityController.java`

```java
// ==================== 管理员管理 ====================

/** 获取活动的管理员列表 */
@GetMapping("/api/activities/{id}/admins")
public ResponseEntity<?> listAdmins(
        @PathVariable String id,
        @AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    List<ActivityAdmin> admins = activityService.listAdmins(id, userId);
    // 增设创建者信息
    Activity activity = activityService.getActivity(id, userId);
    List<Map<String, Object>> result = new ArrayList<>();
    // 先加创建者
    User owner = userMapper.selectById(activity.getUserId());
    Map<String, Object> ownerInfo = new HashMap<>();
    ownerInfo.put("userId", owner.getId());
    ownerInfo.put("phone", owner.getPhone());
    ownerInfo.put("nickname", owner.getNickname());
    ownerInfo.put("avatarUrl", owner.getAvatarUrl());
    ownerInfo.put("role", "owner");
    result.add(ownerInfo);
    // 再加管理员
    admins.forEach(a -> {
        Map<String, Object> info = new HashMap<>();
        info.put("userId", a.getUserId());
        info.put("phone", a.getPhone());
        info.put("nickname", a.getNickname());
        info.put("avatarUrl", a.getAvatarUrl());
        info.put("role", a.getRole());
        result.add(info);
    });
    return ResponseEntity.ok(Map.of("admins", result));
}

/** 添加管理员 */
@PostMapping("/api/activities/{id}/admins")
public ResponseEntity<?> addAdmin(
        @PathVariable String id,
        @Valid @RequestBody AdminAddRequest req,
        @AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    activityService.addAdmin(id, req.getPhone(), userId);
    return ResponseEntity.ok(Map.of("message", "添加成功"));
}

/** 移除管理员 */
@DeleteMapping("/api/activities/{id}/admins/{userId}")
public ResponseEntity<?> removeAdmin(
        @PathVariable String id,
        @PathVariable Integer userId,
        @AuthenticationPrincipal Principal principal) {
    Integer currentUserId = getUserId(principal);
    activityService.removeAdmin(id, userId, currentUserId);
    return ResponseEntity.ok(Map.of("message", "已移除"));
}

/** 获取我管理的活动（创建 + 被设为管理员） */
@GetMapping("/api/user/managed-activities")
public ResponseEntity<?> getManagedActivities(
        @AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    List<Activity> activities = activityService.listManagedActivities(userId);
    return ResponseEntity.ok(Map.of("activities", activities));
}
```

### 5.2 AuthController 新增/修改接口

文件: `baoming-server/src/main/java/com/xiaozongxiong/baoming/auth/AuthController.java`

```java
/** 微信授权登录 — 不强制手机号 */
@PostMapping("/api/auth/wechat-login")
public ResponseEntity<?> wechatLogin(@Valid @RequestBody WechatLoginRequest req) {
    AuthResponse resp = authService.wechatLogin(req);
    return ResponseEntity.ok(resp);
}

/** 绑定手机号 — 登录后可选操作 */
@PostMapping("/api/auth/bind-phone")
public ResponseEntity<?> bindPhone(
        @Valid @RequestBody BindPhoneRequest req,
        @AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    UserResponse user = authService.bindPhone(userId, req);
    return ResponseEntity.ok(Map.of("user", user, "message", "手机号绑定成功"));
}

/** 获取当前用户信息 */
@GetMapping("/api/auth/me")
public ResponseEntity<?> getProfile(@AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    UserResponse user = authService.getUserById(userId);
    return ResponseEntity.ok(Map.of("user", user));
}

/** 更新个人信息（昵称、头像） */
@PutMapping("/api/auth/profile")
public ResponseEntity<?> updateProfile(
        @Valid @RequestBody UpdateProfileRequest req,
        @AuthenticationPrincipal Principal principal) {
    Integer userId = getUserId(principal);
    UserResponse user = authService.updateProfile(userId, req);
    return ResponseEntity.ok(Map.of("user", user));
}
```

### 5.3 SecurityConfig 更新

文件: `baoming-server/src/main/java/com/xiaozongxiong/baoming/config/SecurityConfig.java`

```java
// 新增公开接口（无需登录）
.requestMatchers(HttpMethod.POST, "/api/auth/wechat-login").permitAll()

// 新增需认证接口（登录即可，非 ADMIN 也可以）
.requestMatchers(HttpMethod.POST, "/api/auth/bind-phone").authenticated()
.requestMatchers(HttpMethod.GET, "/api/user/managed-activities").authenticated()
.requestMatchers(HttpMethod.GET, "/api/user/submissions").authenticated()
.requestMatchers(HttpMethod.DELETE, "/api/submissions/**/cancel").authenticated()
.requestMatchers(HttpMethod.PUT, "/api/auth/profile").authenticated()
.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
```

---

## 六、接口汇总

| # | Method | Endpoint | 说明 | 权限 |
|---|--------|----------|------|------|
| 1 | POST | `/api/auth/wechat-login` | **微信授权登录（不强制手机号）** | 公开 |
| 2 | POST | `/api/auth/bind-phone` | **绑定手机号（登录后可选）** | 登录用户 |
| 3 | GET | `/api/auth/me` | 获取当前用户信息 | 登录用户 |
| 4 | PUT | `/api/auth/profile` | 更新昵称/头像 | 登录用户 |
| 5 | GET | `/api/activities/{id}/admins` | 获取活动管理员列表 | 创建者+管理员 |
| 6 | POST | `/api/activities/{id}/admins` | 添加管理员(通过手机号) | 仅创建者 |
| 7 | DELETE | `/api/activities/{id}/admins/{userId}` | 移除管理员 | 仅创建者 |
| 8 | GET | `/api/user/managed-activities` | 我管理的活动列表 | 登录用户 |
| 9 | GET | `/api/user/submissions` | 我参与的报名记录 | 登录用户 |
| 10 | DELETE | `/api/submissions/{id}/cancel` | 取消我的报名 | 本人 |

### 现有需修改的接口

| # | Method | Endpoint | 修改内容 |
|---|--------|----------|----------|
| 10 | GET | `/api/activities/{id}` | findOwned → findManaged（管理员也能查看） |
| 11 | GET | `/api/activities/{id}/submissions` | findOwned → findManaged（管理员也能查看数据） |
| 12 | DELETE | `/api/activities/{id}/submissions` | findOwned → findManaged（管理员也能清空数据） |
| 13 | PUT | `/api/activities/{id}` | 支持 shareLevel 字段更新 |

---

## 七、Activity 模型 shareLevel 说明

| 值 | 含义 | 前端行为 |
|----|------|----------|
| `"all"` | 所有人可分享 | 报名页显示转发按钮，任何人可分享到微信群 |
| `"admins"` | 创建者+管理员可分享 | 报名页隐藏转发按钮，仅创建者和管理员通过发布页分享 |
| `"creator"` | 仅创建者可分享 | 报名页隐藏转发按钮，仅创建者可通过发布页分享 |

兼容性：保留 `allowShare` 布尔字段。
- `allowShare=false` 等价于 `shareLevel="creator"`
- `allowShare=true` 时按 `shareLevel` 字段判断（默认 `"all"`）

---

## 八、实施顺序

1. **先执行数据库迁移** — 运行 V2 SQL 脚本
2. **新增 Model + Mapper** — ActivityAdmin 实体和 Mapper
3. **修改 ActivityService** — findManaged 重构 + 管理员方法
4. **修改 ActivityController** — 新增管理员接口
5. **修改 AuthService/Controller** — 微信登录 + 个人信息更新
6. **修改 SecurityConfig** — 新增接口权限配置
7. **修改 SubmissionService** — 完善 getUserSubmissions
8. **测试验证** — 使用 Postman 测试所有新增接口

---

## 九、建议测试用例

1. **微信授权登录（无手机号）**: POST /api/auth/wechat-login `{ code, nickname, avatarUrl }` — 应创建新用户（phone=null），返回 JWT
2. **微信授权登录（已有用户）**: 同一个 openid 再次调用 — 应返回已有用户，更新昵称头像
3. **绑定手机号**: 已登录用户 POST /api/auth/bind-phone `{ code, encryptedData, iv }` — 应解密并绑定手机号
4. **添加管理员**: 创建者 POST /api/activities/{id}/admins `{ phone }`
5. **管理员查看数据**: 被添加的管理员 GET /api/activities/{id}/submissions — 应返回 200
6. **管理员不能编辑**: 管理员 PUT /api/activities/{id} — 应返回 403
7. **分享等级**: PUT /api/activities/{id} `{ shareLevel: "admins" }` — 应保存成功
8. **我管理的列表**: GET /api/user/managed-activities — 应包含 ownership 和 admin-of 的活动
9. **我参与的列表**: GET /api/user/submissions — 应包含 activityName 和 canCancel 字段
