<template>
  <view class="login-page">
    <view class="login-logo">
      <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
      <text v-else>🐻</text>
    </view>
    <view class="login-title">熊熊活动助手</view>
    <view class="login-desc">活动预约 · 培训报名 · 场馆预约</view>

    <view class="login-card">
      <!-- 微信头像和昵称（可选） -->
      <view class="wx-info">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image v-if="avatarUrl" :src="avatarUrl" class="wx-avatar" mode="aspectFill" />
          <text v-else class="avatar-placeholder">📷</text>
        </button>
        <view class="wx-name-box">
          <input class="nickname-input" type="nickname" v-model="nickname"
                 placeholder="点击获取微信昵称" />
          <text class="wx-tip">选填，可跳过直接登录</text>
        </view>
      </view>

      <!-- 隐私协议 -->
      <view class="agree-row">
        <checkbox :checked="agreed" @click="agreed = !agreed" color="#FF6B35" style="transform:scale(0.7)" />
        <text class="agree-text">我已阅读并同意</text>
        <text class="agree-link" @click.stop="goPrivacy">《用户服务协议及隐私政策》</text>
      </view>

      <!-- 微信授权登录按钮 — 不强制手机号 -->
      <button class="wx-auth-btn" @click="handleWechatAuth"
              :loading="loading" :disabled="loading || !agreed">
        <text class="wx-icon">💬</text>
        <text>{{ loading ? '登录中...' : '微信授权登录' }}</text>
      </button>

      <text class="bottom-tip">首次使用点击授权即自动注册 · 无需手机号</text>

      <!-- 开发模式：账号密码登录（仅测试用） -->
      <view class="dev-toggle" @click="showDevLogin = !showDevLogin">
        {{ showDevLogin ? '收起' : '开发者测试登录' }}
      </view>
      <view v-if="showDevLogin">
        <view class="form-group">
          <text class="form-label">手机号码</text>
          <input class="form-input" v-model="phone" type="number" maxlength="11"
                 placeholder="请输入手机号码" />
        </view>
        <view class="form-group">
          <text class="form-label">密码</text>
          <input class="form-input" v-model="password" type="password"
                 placeholder="请输入密码" />
        </view>
        <button class="btn-primary btn-block" @click="handleDevLogin"
                :loading="loading" :disabled="loading || !agreed">
          {{ loading ? '登录中...' : '账号登录' }}
        </button>
      </view>

      <!-- 返回首页 -->
      <view class="back-link" @click="goHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script>
import { wechatAuthLogin, login } from '@/store/api.js'

export default {
  data() {
    return {
      avatarUrl: '',
      nickname: '',
      loading: false,
      agreed: false,
      showDevLogin: false,
      phone: '13310843925',
      password: 'Aled2239'
    }
  },
  methods: {
    onChooseAvatar(e) {
      this.avatarUrl = e.detail.avatarUrl
      uni.setStorageSync('bm_avatar', this.avatarUrl)
    },

    /** 微信授权登录 — 不强制获取手机号 */
    async handleWechatAuth() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意隐私协议', icon: 'none' })
        return
      }

      this.loading = true
      try {
        // 1. wx.login 获取 code
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({ success: resolve, fail: reject })
        })

        // 2. 仅传 code + 昵称 + 头像，不传手机号
        const user = await wechatAuthLogin({
          code: loginRes.code,
          nickname: this.nickname || '微信用户',
          avatarUrl: this.avatarUrl || ''
        })

        uni.setStorageSync('bm_avatar', this.avatarUrl)
        uni.setStorageSync('bm_nickname', this.nickname)
        getApp().globalData.user = user
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/profile/profile' })
        }, 500)
      } catch (err) {
        uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 开发者登录
    async handleDevLogin() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意隐私协议', icon: 'none' })
        return
      }
      this.loading = true
      try {
        const user = await login(this.phone, this.password)
        getApp().globalData.user = user
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/profile/profile' })
        }, 500)
      } catch (err) {
        uni.showToast({ title: err.message || '登录失败', icon: 'none' })
      } finally { this.loading = false }
    },

    goPrivacy() {
      uni.navigateTo({ url: '/pages/privacy/privacy' })
    },
    goHome() {
      uni.switchTab({ url: '/pages/dashboard/dashboard' })
    }
  },
  onLoad() {
    this.avatarUrl = uni.getStorageSync('bm_avatar') || ''
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #FF6B35, #E55A2B, #2D1F18);
  padding: 60rpx;
}
.login-logo {
  width: 140rpx; height: 140rpx;
  background: rgba(255,255,255,0.18);
  border-radius: 28rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 64rpx; margin-bottom: 20rpx;
  overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; border-radius: 28rpx; }
.login-title { font-size: 44rpx; font-weight: 700; color: #fff; }
.login-desc { font-size: 26rpx; color: rgba(255,255,255,0.7); margin-bottom: 48rpx; }
.login-card {
  width: 100%; background: #fff; border-radius: 24rpx;
  padding: 48rpx 36rpx 36rpx; box-shadow: 0 16rpx 64rpx rgba(0,0,0,0.15);
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

/* 微信授权登录按钮 */
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
.form-group { margin-bottom: 24rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }
.back-link { text-align: center; margin-top: 24rpx; padding: 12rpx; }
.back-link text { font-size: 26rpx; color: #999; }
</style>
