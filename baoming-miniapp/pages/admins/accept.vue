<template>
  <view class="page">
    <view class="card" v-if="loading">
      <view class="empty-state">
        <text class="empty-icon">⏳</text>
        <text class="empty-text">处理中...</text>
      </view>
    </view>

    <view class="card" v-else-if="error">
      <view class="empty-state">
        <text class="empty-icon">❌</text>
        <text class="empty-text">{{ error }}</text>
      </view>
      <button class="btn-outline btn-block" @click="goHome">返回首页</button>
    </view>

    <view class="card" v-else-if="accepted">
      <view class="empty-state">
        <text class="empty-icon">✅</text>
        <text class="empty-text">已成功成为「{{ activityName }}」的管理员</text>
        <text class="empty-sub">你可以查看和管理该活动的报名数据</text>
      </view>
      <button class="btn-primary btn-block" @click="goRecords">查看我管理的活动</button>
    </view>

    <view class="card" v-else>
      <view class="invite-card">
        <text class="invite-icon">📋</text>
        <text class="invite-title">管理员邀请</text>
        <text class="invite-desc">你被邀请成为「{{ activityName }}」的管理员</text>
        <text class="invite-info">接受后，你将可以：
          查看报名数据 · 导出CSV · 删除报名记录</text>
      </view>
      <button class="btn-primary btn-block" @click="handleAccept" :loading="submitting">
        接受邀请
      </button>
      <button class="btn-outline btn-block" style="margin-top:16rpx" @click="goHome">
        拒绝
      </button>
    </view>
  </view>
</template>

<script>
import { getActivity, acceptAdminInvite } from '@/store/api.js'

export default {
  data() {
    return {
      activityId: '',
      inviteToken: '',
      activityName: '',
      loading: true,
      submitting: false,
      accepted: false,
      error: ''
    }
  },
  onLoad(options) {
    // 先检查登录
    if (!uni.getStorageSync('bm_token')) {
      uni.setStorageSync('bm_pending_admin_accept', JSON.stringify({
        activityId: options.id || '',
        token: options.token || ''
      }))
      uni.showModal({
        title: '需要登录',
        content: '请先微信授权登录后再接受管理员邀请',
        confirmText: '去登录',
        success: res => {
          if (res.confirm) {
            uni.switchTab({ url: '/pages/profile/profile' })
          } else {
            uni.navigateBack()
          }
        }
      })
      return
    }

    this.activityId = options.id || ''
    this.inviteToken = options.token || ''
    if (this.activityId) {
      this.loadInfo()
    }
  },
  methods: {
    async loadInfo() {
      try {
        const activity = await getActivity(this.activityId)
        this.activityName = activity.name || '未命名活动'
      } catch (e) {
        this.activityName = '未知活动'
      } finally {
        this.loading = false
      }
    },
    async handleAccept() {
      this.submitting = true
      try {
        await acceptAdminInvite(this.activityId, this.inviteToken)
        this.accepted = true
        uni.showToast({ title: '接受成功', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: err.message || '接受失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    goHome() {
      uni.switchTab({ url: '/pages/dashboard/dashboard' })
    },
    goRecords() {
      uni.switchTab({ url: '/pages/records/records' })
    }
  }
}
</script>

<style scoped>
.page { padding: 40rpx 20rpx; min-height: 100vh; background: #F8F6F3; }
.card { background: #fff; border-radius: 20rpx; padding: 40rpx 28rpx; }

.invite-card { text-align: center; margin-bottom: 40rpx; }
.invite-icon { font-size: 100rpx; display: block; margin-bottom: 16rpx; }
.invite-title { font-size: 36rpx; font-weight: 700; display: block; }
.invite-desc { font-size: 28rpx; color: #666; display: block; margin: 16rpx 0; }
.invite-info { font-size: 24rpx; color: #999; display: block; line-height: 1.8; }

.empty-state { text-align: center; padding: 40rpx 0; }
.empty-icon { font-size: 80rpx; display: block; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #333; display: block; }
.empty-sub { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
</style>
