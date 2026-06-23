<template>
  <view class="page">
    <!-- ========== 未登录状态 ========== -->
    <view v-if="!isLoggedIn" class="unlogged">
      <view class="profile-header-outer">
        <view class="ph-logo">🐻</view>
        <view class="ph-title">小棕熊预约报名</view>
        <view class="ph-desc">微信授权登录，无需手机号</view>
      </view>

      <view class="login-card">
        <!-- 微信头像和昵称（可选） -->
        <view class="wx-info">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="loginAvatar" :src="loginAvatar" class="wx-avatar" mode="aspectFill" />
            <text v-else class="avatar-placeholder">📷</text>
          </button>
          <view class="wx-name-box">
            <input class="nickname-input" type="nickname" v-model="loginNickname"
                   placeholder="点击获取微信昵称" />
            <text class="wx-tip">选填，可设置或跳过</text>
          </view>
        </view>

        <!-- 隐私协议 -->
        <view class="agree-row">
          <checkbox :checked="agreed" @click="agreed = !agreed" color="#FF6B35" style="transform:scale(0.7)" />
          <text class="agree-text">我已阅读并同意</text>
          <text class="agree-link" @click.stop="goPrivacy">《用户服务协议及隐私政策》</text>
        </view>

        <!-- 微信授权登录按钮 -->
        <button class="wx-auth-btn" @click="handleWechatAuth"
                :loading="loading" :disabled="loading || !agreed">
          <text class="wx-icon">💬</text>
          <text>{{ loading ? '登录中...' : '微信授权登录' }}</text>
        </button>

        <text class="bottom-tip">点击授权即表示同意上述协议 · 无需手机号</text>

        <!-- 开发者测试登录 -->
        <view class="dev-toggle" @click="showDevLogin = !showDevLogin">
          {{ showDevLogin ? '收起' : '开发者测试登录' }}
        </view>
        <view v-if="showDevLogin" class="dev-form">
          <view class="form-group">
            <text class="form-label">手机号码</text>
            <input class="form-input" v-model="devPhone" type="number" maxlength="11" placeholder="请输入手机号码" />
          </view>
          <view class="form-group">
            <text class="form-label">密码</text>
            <input class="form-input" v-model="devPassword" type="password" placeholder="请输入密码" />
          </view>
          <button class="btn-primary btn-block" @click="handleDevLogin"
                  :loading="loading" :disabled="loading || !agreed">
            {{ loading ? '登录中...' : '账号登录' }}
          </button>
        </view>
      </view>
    </view>

    <!-- ========== 已登录状态 ========== -->
    <view v-else class="logged">
      <!-- 个人信息卡片 -->
      <view class="profile-header-card">
        <view class="phc-bg"></view>
        <view class="phc-content">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image v-if="userAvatar" :src="userAvatar" class="user-avatar" mode="aspectFill" />
            <text v-else class="avatar-placeholder">📷</text>
          </button>
          <view class="user-info">
            <text class="user-name">{{ userNickname || '微信用户' }}</text>
            <text class="user-phone">{{ userPhone || '未绑定手机号' }}</text>
            <text :class="'badge ' + (userRole === 'ADMIN' ? 'badge-primary' : 'badge-info')">
              {{ userRole === 'ADMIN' ? '管理员' : '普通用户' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 快速填写入口 -->
      <view class="section-card" @click="showQuickFill = true">
        <view class="qf-entry">
          <view class="qf-left">
            <text class="qf-icon">⚡</text>
            <view>
              <text class="qf-title">快速填写</text>
              <text class="qf-sub">报名时自动填充姓名、手机号、身份证</text>
            </view>
          </view>
          <text class="qf-arrow">›</text>
        </view>
        <view class="qf-preview">
          <text class="qfp-item">{{ quickName || '姓名未设' }}</text>
          <text class="qfp-divider">|</text>
          <text class="qfp-item">{{ quickPhone || '手机未设' }}</text>
          <text class="qfp-divider">|</text>
          <text class="qfp-item">{{ quickIdCard ? (quickIdCard.slice(0,3)+'****'+quickIdCard.slice(-3)) : '身份证未设' }}</text>
        </view>
      </view>

      <!-- 快速填写弹框 -->
      <view class="modal-overlay" v-if="showQuickFill" @click="showQuickFill = false">
        <view class="modal-content" @click.stop>
          <view class="modal-header">
            <text class="modal-title">⚡ 快速填写</text>
            <button class="modal-close" @click="showQuickFill = false">✕</button>
          </view>
          <text class="modal-desc">设置后报名时自动填充到对应字段</text>
          <view class="qf-row">
            <text class="qf-label">姓名</text>
            <input class="form-input" v-model="quickName" placeholder="请输入姓名" />
          </view>
          <view class="qf-row">
            <text class="qf-label">手机号</text>
            <input class="form-input" v-model="quickPhone" type="number" maxlength="11" placeholder="请输入手机号" />
          </view>
          <view class="qf-row">
            <text class="qf-label">身份证</text>
            <input class="form-input" v-model="quickIdCard" maxlength="18" placeholder="请输入身份证号" />
          </view>
          <button class="btn-primary btn-block" @click="saveQuickFill" :loading="quickSaving">
            💾 保存
          </button>
        </view>
      </view>

      <!-- 隐私安全设置 -->
      <view class="section-card">
        <text class="section-title">隐私安全设置</text>
        <text class="section-desc">以下信息用于活动报名时的身份核验</text>

        <!-- 手机号：支持微信绑定或手工输入 -->
        <view class="privacy-field">
          <view class="pf-left">
            <text class="pf-icon">📱</text>
            <view class="pf-info">
              <text class="pf-label">手机号码</text>
              <text class="pf-val">{{ userPhone || '未绑定，报名时可能需要填写' }}</text>
            </view>
          </view>
          <view v-if="!userPhone" class="pf-actions">
            <button class="bind-btn" open-type="getPhoneNumber"
                    @getphonenumber="handleBindPhone">微信绑定</button>
            <text class="pf-or">或</text>
            <button class="bind-btn" @click="showPhoneInput = !showPhoneInput">手动输入</button>
          </view>
          <text v-else class="pf-status bound">✓ 已绑定</text>
        </view>

        <!-- 手工输入手机号 -->
        <view v-if="showPhoneInput && !userPhone" class="phone-input-row">
          <input class="form-input" v-model="manualPhone" type="number" maxlength="11" placeholder="输入手机号码" />
          <button class="btn-primary btn-sm" @click="savePhone" :loading="savingPhone">保存</button>
        </view>

        <!-- 微信昵称 -->
        <view class="privacy-field">
          <view class="pf-left">
            <text class="pf-icon">👤</text>
            <view class="pf-info">
              <text class="pf-label">微信昵称</text>
              <text class="pf-val">{{ userNickname || '未设置' }}</text>
            </view>
          </view>
          <button class="bind-btn" @click="showNicknameEdit = !showNicknameEdit">
            {{ showNicknameEdit ? '取消' : '修改' }}
          </button>
        </view>

        <!-- 编辑昵称 -->
        <view v-if="showNicknameEdit" class="phone-input-row">
          <input class="form-input" v-model="editNickname" placeholder="输入新昵称" />
          <button class="btn-primary btn-sm" @click="saveNickname" :loading="savingNickname">保存</button>
        </view>

        <!-- 微信头像 -->
        <view class="privacy-field">
          <view class="pf-left">
            <text class="pf-icon">🖼️</text>
            <view class="pf-info">
              <text class="pf-label">微信头像</text>
              <text class="pf-val">{{ userAvatar ? '已设置' : '未设置' }}</text>
            </view>
          </view>
          <button class="bind-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            更换
          </button>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-card">
        <view class="menu-item" @click="goPrivacy">
          <view class="mi-left">
            <text class="mi-icon">📄</text>
            <text class="mi-label">用户服务协议及隐私政策</text>
          </view>
          <text class="mi-arrow">›</text>
        </view>

        <view class="menu-item" @click="showAbout">
          <view class="mi-left">
            <text class="mi-icon">ℹ️</text>
            <text class="mi-label">关于我们</text>
          </view>
          <text class="mi-arrow">›</text>
        </view>

        <view class="menu-item" @click="handleDeleteAccount">
          <view class="mi-left">
            <text class="mi-icon">🗑️</text>
            <text class="mi-label" style="color:#D32F2F">注销账号</text>
          </view>
          <text class="mi-arrow" style="color:#D32F2F">›</text>
        </view>

        <view class="menu-item" @click="handleLogout">
          <view class="mi-left">
            <text class="mi-icon">🚪</text>
            <text class="mi-label" style="color:#D32F2F">退出登录</text>
          </view>
          <text class="mi-arrow" style="color:#D32F2F">›</text>
        </view>
      </view>

      <view class="version-info">版本 1.0.0</view>
      <view class="icp-info">
        <text class="icp-link" @click="openIcp">粤ICP备TBC号</text>
      </view>
    </view>
  </view>
</template>

<script>
import { wechatAuthLogin, bindPhone, login, getMyProfile, updateProfile, deleteAccount } from '@/store/api.js'

export default {
  data() {
    return {
      // 登录相关
      loginAvatar: '',
      loginNickname: '',
      agreed: false,
      showDevLogin: false,
      devPhone: '13310843925',
      devPassword: 'Aled2239',
      loading: false,

      // 用户信息
      isLoggedIn: false,
      userAvatar: '',
      userNickname: '',
      userPhone: '',
      userRole: '',

      // 快速填写
      showQuickFill: false,
      quickSaving: false,
      quickName: '',
      quickPhone: '',
      quickIdCard: '',

      // 手机手工输入
      showPhoneInput: false,
      manualPhone: '',
      savingPhone: false,

      // 昵称编辑
      showNicknameEdit: false,
      editNickname: '',
      savingNickname: false
    }
  },
  onShow() {
    this.checkLoginState()
  },
  methods: {
    checkLoginState() {
      const token = uni.getStorageSync('bm_token')
      const userStr = uni.getStorageSync('bm_user')
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.isLoggedIn = true
          this.userPhone = user.phone || ''
          this.userNickname = user.nickname || uni.getStorageSync('bm_nickname') || ''
          this.userAvatar = user.avatarUrl || uni.getStorageSync('bm_avatar') || ''
          this.userRole = user.role || 'USER'
          this.quickName = user.realName || ''
          this.quickPhone = user.phone || ''
          this.quickIdCard = user.idCard || ''
          getApp().globalData.token = token
          getApp().globalData.user = user
          this.refreshProfile()
          // 检查是否有待跳转的表单页
          const pendingForm = uni.getStorageSync('bm_pending_form')
          if (pendingForm) {
            uni.removeStorageSync('bm_pending_form')
            setTimeout(() => {
              uni.navigateTo({ url: `/pages/form/form?id=${pendingForm}` })
            }, 500)
          }
          // 检查是否有待接受的管理员邀请
          const pendingAdmin = uni.getStorageSync('bm_pending_admin_accept')
          if (pendingAdmin) {
            uni.removeStorageSync('bm_pending_admin_accept')
            try {
              const data = JSON.parse(pendingAdmin)
              setTimeout(() => {
                uni.navigateTo({ url: `/pages/admins/accept?id=${data.activityId}&token=${data.token}` })
              }, 500)
            } catch (e) {}
          }
        } catch (e) {
          this.isLoggedIn = false
        }
      } else {
        this.isLoggedIn = false
      }
    },

    async refreshProfile() {
      try {
        const user = await getMyProfile()
        this.userPhone = user.phone || this.userPhone
        this.userNickname = user.nickname || this.userNickname
        this.userAvatar = user.avatarUrl || this.userAvatar
        this.userRole = user.role || this.userRole
      } catch (e) {
        // 静默失败
      }
    },

    // ========== 微信授权登录 ==========

    onChooseAvatar(e) {
      const url = e.detail.avatarUrl
      if (this.isLoggedIn) {
        this.userAvatar = url
        uni.setStorageSync('bm_avatar', url)
        // 同步更新到后端
        updateProfile({ avatarUrl: url }).catch(() => {})
      } else {
        this.loginAvatar = url
        uni.setStorageSync('bm_avatar', url)
      }
    },

    /** 微信授权登录 — 不需要手机号 */
    async handleWechatAuth() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意隐私协议', icon: 'none' })
        return
      }

      this.loading = true
      try {
        // 1. 调用 wx.login 获取临时 code
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({ success: resolve, fail: reject })
        })

        // 2. 用 code + 昵称 + 头像调用后端（不传手机号）
        const user = await wechatAuthLogin({
          code: loginRes.code,
          nickname: this.loginNickname || '微信用户',
          avatarUrl: this.loginAvatar || ''
        })

        uni.setStorageSync('bm_avatar', this.loginAvatar)
        uni.setStorageSync('bm_nickname', this.loginNickname)
        getApp().globalData.user = user
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          this.checkLoginState()
        }, 300)
      } catch (err) {
        uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // ========== 绑定手机号（登录后可选操作） ==========

    async handleBindPhone(e) {
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        uni.showToast({ title: '需要授权手机号', icon: 'none' })
        return
      }

      uni.showLoading({ title: '绑定中...' })
      try {
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({ success: resolve, fail: reject })
        })

        const user = await bindPhone({
          code: loginRes.code,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        })

        getApp().globalData.user = user
        this.userPhone = user.phone || ''
        uni.hideLoading()
        uni.showToast({ title: '手机号绑定成功', icon: 'success' })
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: err.message || '绑定失败', icon: 'none' })
      }
    },

    /** 手工输入手机号保存 */
    async savePhone() {
      if (!this.manualPhone || this.manualPhone.length < 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return
      }
      this.savingPhone = true
      try {
        const user = await updateProfile({ phone: this.manualPhone })
        getApp().globalData.user = user
        this.userPhone = user.phone || this.manualPhone
        this.showPhoneInput = false
        this.manualPhone = ''
        uni.showToast({ title: '手机号保存成功', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: err.message || '保存失败', icon: 'none' })
      } finally { this.savingPhone = false }
    },

    /** 保存快速填写信息 */
    async saveQuickFill() {
      this.quickSaving = true
      try {
        const user = await updateProfile({
          realName: this.quickName,
          phone: this.quickPhone,
          idCard: this.quickIdCard
        })
        getApp().globalData.user = user
        this.showQuickFill = false
        uni.showToast({ title: '已保存', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.quickSaving = false
      }
    },

    /** 修改昵称 */
    async saveNickname() {
      if (!this.editNickname.trim()) {
        uni.showToast({ title: '请输入新昵称', icon: 'none' }); return
      }
      this.savingNickname = true
      try {
        const user = await updateProfile({ nickname: this.editNickname.trim() })
        getApp().globalData.user = user
        this.userNickname = user.nickname || this.editNickname.trim()
        uni.setStorageSync('bm_nickname', this.userNickname)
        this.showNicknameEdit = false
        uni.showToast({ title: '昵称已更新', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: err.message || '更新失败', icon: 'none' })
      } finally { this.savingNickname = false }
    },

    // ========== 开发者登录 ==========

    async handleDevLogin() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意隐私协议', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const user = await login(this.devPhone, this.devPassword)
        getApp().globalData.user = user
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          this.checkLoginState()
        }, 300)
      } catch (err) {
        uni.showToast({ title: err.message || '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // ========== 退出登录 ==========

    async handleDeleteAccount() {
      const res = await new Promise(r => uni.showModal({
        title: '注销账号',
        content: '注销后你的账号数据将被永久删除，包括你创建的活动和报名记录。此操作不可恢复！',
        confirmText: '确认注销',
        cancelText: '取消',
        success: e => r(e.confirm)
      }))
      if (!res) return
      // 二次确认
      const res2 = await new Promise(r => uni.showModal({
        title: '再次确认',
        content: '真的确定要注销吗？此操作不可逆！',
        confirmText: '是的，注销',
        cancelText: '取消',
        success: e => r(e.confirm)
      }))
      if (!res2) return
      try {
        await deleteAccount()
        uni.removeStorageSync('bm_token')
        uni.removeStorageSync('bm_user')
        getApp().globalData.token = ''
        getApp().globalData.user = null
        uni.showToast({ title: '账号已注销', icon: 'success' })
        setTimeout(() => this.checkLoginState(), 500)
      } catch (err) {
        uni.showToast({ title: '注销失败: ' + err.message, icon: 'none' })
      }
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: res => {
          if (res.confirm) {
            uni.removeStorageSync('bm_token')
            uni.removeStorageSync('bm_user')
            getApp().globalData.token = ''
            getApp().globalData.user = null
            this.isLoggedIn = false
            this.userPhone = ''
            this.userNickname = ''
            this.userAvatar = ''
            this.userRole = ''
            uni.showToast({ title: '已退出', icon: 'success' })
          }
        }
      })
    },

    goPrivacy() {
      uni.navigateTo({ url: '/pages/privacy/privacy' })
    },

    openIcp() {
      uni.setClipboardData({ data: 'http://beian.miit.gov.cn', success: () => uni.showToast({ title: '备案号已复制，浏览器打开查验' }) })
    },
    showAbout() {
      uni.showModal({
        title: '关于我们',
        content: '小棕熊预约报名 v1.0.0\n\n活动预约报名工具——培训讲座、聚会活动、场馆预约、信息登记，快速创建报名表，管理报名数据。\n\n© 2026 小棕熊',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F6F3; padding-bottom: 40rpx; }

/* ====== 未登录 ====== */
.unlogged {
  min-height: 100vh;
  background: linear-gradient(160deg, #FF6B35, #E55A2B, #2D1F18);
  padding: 60rpx 40rpx;
}
.profile-header-outer {
  text-align: center; color: #fff;
  padding: 60rpx 0 48rpx;
}
.ph-logo {
  width: 140rpx; height: 140rpx;
  background: rgba(255,255,255,0.18);
  border-radius: 28rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 64rpx; margin: 0 auto 20rpx;
}
.ph-title { font-size: 44rpx; font-weight: 700; }
.ph-desc { font-size: 26rpx; opacity: 0.7; margin-top: 8rpx; }

.login-card {
  background: #fff; border-radius: 24rpx;
  padding: 48rpx 36rpx 36rpx;
  box-shadow: 0 16rpx 64rpx rgba(0,0,0,0.15);
}

.wx-info { display: flex; align-items: center; gap: 20rpx; margin-bottom: 32rpx; }
.avatar-btn {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  border: none; background: #F5F3F0; padding: 0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.wx-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; }
.avatar-placeholder { font-size: 44rpx; }
.wx-name-box { flex: 1; }
.nickname-input {
  width: 100%; height: 80rpx; padding: 0 20rpx;
  background: #F9F8F6; border-radius: 12rpx; font-size: 30rpx;
}
.wx-tip { font-size: 22rpx; color: #999; margin-top: 6rpx; display: block; }

.agree-row {
  display: flex; align-items: center; gap: 4rpx;
  padding: 8rpx 0; margin-bottom: 20rpx;
}
.agree-text { font-size: 24rpx; color: #999; }
.agree-link { font-size: 24rpx; color: #FF6B35; }

/* 微信授权登录按钮 — 微信绿 */
.wx-auth-btn {
  width: 100%; height: 96rpx;
  background: #07C160; color: #fff;
  border: none; border-radius: 48rpx;
  font-size: 32rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
}
.wx-auth-btn[disabled] { opacity: 0.5; }
.wx-icon { font-size: 40rpx; }
.bottom-tip { display: block; text-align: center; font-size: 24rpx; color: #999; margin-top: 12rpx; }
.dev-toggle { text-align: center; font-size: 22rpx; color: #ccc; margin-top: 24rpx; padding: 12rpx; }
.dev-form { margin-top: 12rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }

/* ====== 已登录 ====== */
.logged { padding: 20rpx; }

.profile-header-card {
  background: #fff; border-radius: 24rpx;
  overflow: hidden; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.phc-bg {
  height: 120rpx;
  background: linear-gradient(160deg, #FF6B35, #E55A2B);
}
.phc-content {
  display: flex; align-items: center; gap: 24rpx;
  padding: 0 28rpx 28rpx; margin-top: -44rpx;
}
.user-avatar {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  border: 4rpx solid #fff;
}
.user-info { flex: 1; }
.user-name { font-size: 34rpx; font-weight: 600; display: block; margin-top: 40rpx; }
.user-phone { font-size: 26rpx; color: #999; display: block; margin: 6rpx 0 10rpx; }

/* 隐私安全 */
.section-card {
  background: #fff; border-radius: 20rpx;
  padding: 28rpx; margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.section-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 6rpx; }
.section-desc { font-size: 24rpx; color: #999; display: block; margin-bottom: 24rpx; }

.qf-entry { display: flex; align-items: center; justify-content: space-between; }
.qf-left { display: flex; align-items: center; gap: 16rpx; }
.qf-icon { font-size: 40rpx; }
.qf-title { font-size: 28rpx; font-weight: 600; display: block; }
.qf-sub { font-size: 22rpx; color: #999; }
.qf-arrow { font-size: 32rpx; color: #ccc; }
.qf-preview { display: flex; align-items: center; gap: 8rpx; margin-top: 16rpx; padding-top: 16rpx; border-top: 2rpx solid #F5F5F7; }
.qfp-item { font-size: 22rpx; color: #999; }
.qfp-divider { font-size: 20rpx; color: #ddd; }

.qf-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx; }
.qf-label { font-size: 26rpx; font-weight: 500; width: 100rpx; flex-shrink: 0; }
.qf-row .form-input { flex: 1; height: 72rpx; font-size: 26rpx; }

/* modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: #fff; border-radius: 32rpx 32rpx 0 0; padding: 32rpx; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.modal-title { font-size: 34rpx; font-weight: 600; }
.modal-close { background: #F0F0F2; border: none; width: 56rpx; height: 56rpx; border-radius: 50%; font-size: 24rpx; }
.modal-desc { font-size: 24rpx; color: #999; display: block; margin-bottom: 28rpx; }

.privacy-field {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx 0; border-bottom: 2rpx solid #F5F5F7;
}
.privacy-field:last-child { border-bottom: none; }
.pf-left { display: flex; align-items: center; gap: 16rpx; flex: 1; }
.pf-icon { font-size: 36rpx; flex-shrink: 0; }
.pf-info { flex: 1; min-width: 0; }
.pf-label { font-size: 28rpx; font-weight: 500; display: block; }
.pf-val { font-size: 22rpx; color: #999; display: block; margin-top: 2rpx; }
.pf-status { font-size: 22rpx; color: #ccc; flex-shrink: 0; }
.pf-status.bound { color: #4CAF50; }

/* 绑定按钮 */
.bind-btn {
  background: none; border: 2rpx solid #FF6B35;
  color: #FF6B35; font-size: 22rpx;
  padding: 8rpx 20rpx; border-radius: 24rpx;
  flex-shrink: 0; margin-left: 12rpx;
}

.pf-actions { display: flex; align-items: center; gap: 8rpx; flex-shrink: 0; }
.pf-or { font-size: 20rpx; color: #ccc; }

.phone-input-row {
  display: flex; gap: 12rpx; align-items: center;
  padding: 12rpx 0 20rpx; border-bottom: 2rpx solid #F5F5F7;
}
.phone-input-row .form-input { flex: 1; }
.phone-input-row .btn-sm { padding: 14rpx 24rpx; font-size: 24rpx; white-space: nowrap; }

/* 菜单 */
.menu-card {
  background: #fff; border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  margin-bottom: 24rpx;
}
.menu-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx 28rpx; border-bottom: 2rpx solid #F5F5F7;
}
.menu-item:last-child { border-bottom: none; }
.mi-left { display: flex; align-items: center; gap: 16rpx; }
.mi-icon { font-size: 36rpx; }
.mi-label { font-size: 28rpx; }
.mi-arrow { font-size: 36rpx; color: #ccc; }

.version-info { text-align: center; font-size: 24rpx; color: #ccc; padding: 20rpx 20rpx 4rpx; }
.icp-info { text-align: center; padding: 0 20rpx 40rpx; }
.icp-link { font-size: 22rpx; color: #999; text-decoration: underline; }
</style>
