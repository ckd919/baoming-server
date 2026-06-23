<template>
  <view class="page">
    <!-- 活动信息 -->
    <view class="info-bar" v-if="activityName">
      <text>📋 {{ activityName }}</text>
    </view>

    <!-- 当前管理员列表 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">👥 活动管理员</text>
        <text class="card-count">{{ admins.length }}人</text>
      </view>
      <text class="card-desc">管理员可以查看报名数据、导出和删除提交记录</text>

      <view v-if="loading" class="empty-state">
        <text class="empty-icon">⏳</text>
        <text class="empty-text">加载中...</text>
      </view>

      <view v-else-if="admins.length === 0" class="empty-state">
        <text class="empty-icon">👤</text>
        <text class="empty-text">还未设置管理员</text>
        <text class="empty-sub">添加管理员后，他们可以协助管理报名数据</text>
      </view>

      <view v-else class="admin-list">
        <view class="admin-item" v-for="admin in admins" :key="admin.userId">
          <view class="ai-left">
            <view class="ai-avatar">
              <image v-if="admin.avatarUrl" :src="admin.avatarUrl" mode="aspectFill" />
              <text v-else>👤</text>
            </view>
            <view class="ai-info">
              <text class="ai-name">{{ admin.nickname || '微信用户' }}</text>
              <text class="ai-phone">{{ admin.phone }}</text>
            </view>
          </view>
          <view class="ai-right">
            <text class="ai-role">{{ admin.role === 'owner' ? '创建者' : '管理员' }}</text>
            <button v-if="isOwner && admin.role !== 'owner'" class="btn-remove"
                    @click="removeAdmin(admin.userId)">移除</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请管理员（仅创建者可见） -->
    <view class="card" v-if="isOwner">
      <text class="card-title">📨 邀请微信好友成为管理员</text>
      <text class="card-desc">发送管理员邀请卡片给微信好友，对方点开即可认领</text>

      <!-- 步骤1：生成邀请 -->
      <button class="btn-primary btn-block" @click="handleGenInviteToken" :loading="genLoading">
        {{ inviteToken ? '✅ 邀请已生成' : '🔑 生成邀请链接' }}
      </button>

      <!-- 步骤2：分享给好友 -->
      <button v-if="inviteToken" class="wx-share-btn" open-type="share">
        <text>💬 发送邀请给微信好友</text>
      </button>
      <text v-if="inviteToken" class="help-text">
        💡 好友点击卡片后打开小程序，点击「接受」即成为管理员
      </text>
    </view>

    <!-- 历史管理员快速添加 -->
    <view class="card" v-if="isOwner && historyAdmins.length > 0">
      <text class="card-title">⭐ 曾经的管理员</text>
      <text class="card-desc">点击快速添加，无需重新邀请</text>
      <view class="history-item" v-for="h in historyAdmins" :key="h.adminId"
            @click="quickAddAdmin(h)">
        <image v-if="h.avatarUrl" :src="h.avatarUrl" class="hi-avatar" mode="aspectFill" />
        <text v-else class="hi-avatar-text">👤</text>
        <view class="hi-info">
          <text class="hi-name">{{ h.nickname || '用户' }}</text>
          <text class="hi-phone">{{ h.phone }}</text>
        </view>
        <text class="hi-add">+添加</text>
      </view>
    </view>

    <!-- 手机号添加管理员（备用） -->
    <view class="card" v-if="isOwner">
      <text class="card-title">➕ 通过手机号添加</text>
      <text class="card-desc">输入对方的手机号码（备用方式）</text>
      <view class="add-form">
        <view class="form-group">
          <text class="form-label">手机号码</text>
          <view class="add-row">
            <input class="form-input" v-model="addPhone" type="number" maxlength="11"
                   placeholder="输入对方手机号码" />
            <button class="btn-primary btn-sm" @click="handleAddAdmin"
                    :loading="adding" :disabled="adding || !addPhone">
              {{ adding ? '添加中...' : '添加' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 权限说明 -->
    <view class="card">
      <text class="card-title">📌 管理员权限说明</text>
      <view class="perm-list">
        <view class="perm-item">
          <text class="perm-icon">✅</text>
          <text class="perm-text">查看活动报名数据</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">✅</text>
          <text class="perm-text">导出报名数据为CSV</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">✅</text>
          <text class="perm-text">删除报名记录</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">✅</text>
          <text class="perm-text">清空所有报名数据</text>
        </view>
        <view class="perm-divider"></view>
        <view class="perm-item">
          <text class="perm-icon">❌</text>
          <text class="perm-text">编辑活动信息</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">❌</text>
          <text class="perm-text">修改报名表单字段</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">❌</text>
          <text class="perm-text">删除活动</text>
        </view>
        <view class="perm-item">
          <text class="perm-icon">❌</text>
          <text class="perm-text">添加/移除其他管理员</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getActivityAdmins, addActivityAdmin, removeActivityAdmin, getActivity, generateAdminInviteToken, getAdminHistory } from '@/store/api.js'

export default {
  data() {
    return {
      activityId: '',
      activityName: '',
      admins: [],
      historyAdmins: [],
      inviteToken: '',  // 管理员邀请 token
      genLoading: false,
      isOwner: false,
      loading: true,
      addPhone: '',
      adding: false
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('bm_token')) {
      uni.switchTab({ url: '/pages/profile/profile' }); return
    }
    if (options.id) {
      this.activityId = options.id
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        // 并行加载活动信息和管理员列表
        const [activity, admins, history] = await Promise.all([
          getActivity(this.activityId).catch(() => null),
          getActivityAdmins(this.activityId).catch(() => []),
          getAdminHistory().catch(() => [])
        ])
        if (activity) {
          this.activityName = activity.name
        }
        this.admins = admins || []
        // 过滤掉已经是当前活动管理员的
        const currentAdminIds = (admins || []).map(a => a.userId)
        this.historyAdmins = (history || []).filter(h => !currentAdminIds.includes(h.adminId))

        // 判断当前用户是否为创建者
        const userStr = uni.getStorageSync('bm_user')
        if (userStr && activity) {
          try {
            const user = JSON.parse(userStr)
            this.isOwner = activity.userId === user.id
          } catch (e) {
            this.isOwner = false
          }
        }
      } catch (err) {
        uni.showToast({ title: '加载失败: ' + err.message, icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async handleAddAdmin() {
      if (!this.addPhone || this.addPhone.length < 11) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      this.adding = true
      try {
        await addActivityAdmin(this.activityId, this.addPhone)
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.addPhone = ''
        this.loadData()
      } catch (err) {
        uni.showToast({ title: '添加失败: ' + err.message, icon: 'none' })
      } finally {
        this.adding = false
      }
    },

    async removeAdmin(userId) {
      const res = await new Promise(r => uni.showModal({
        title: '确认移除',
        content: '确定要移除此管理员吗？',
        success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        await removeActivityAdmin(this.activityId, userId)
        uni.showToast({ title: '已移除', icon: 'success' })
        this.loadData()
      } catch (err) {
        uni.showToast({ title: '移除失败', icon: 'none' })
      }
    },

    /** 从历史记录快速添加管理员 */
    async quickAddAdmin(h) {
      try {
        await addActivityAdmin(this.activityId, h.phone)
        uni.showToast({ title: '已添加 ' + (h.nickname || h.phone), icon: 'success' })
        this.loadData()
      } catch (err) {
        uni.showToast({ title: '添加失败: ' + err.message, icon: 'none' })
      }
    },

    /** 生成管理员邀请 token */
    async handleGenInviteToken() {
      this.genLoading = true
      try {
        const result = await generateAdminInviteToken(this.activityId)
        this.inviteToken = result.inviteToken
        uni.showToast({ title: '邀请已生成，点击下方按钮发送', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: '生成邀请失败', icon: 'none' })
      } finally {
        this.genLoading = false
      }
    }
  },
  // 分享管理员邀请卡片
  onShareAppMessage() {
    return {
      title: `邀请你成为「${this.activityName}」的管理员`,
      path: `/pages/admins/accept?id=${this.activityId}&token=${this.inviteToken}`,
      imageUrl: ''
    }
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 40rpx; }

.info-bar {
  background: #fff; border-radius: 12rpx;
  padding: 20rpx 24rpx; margin-bottom: 20rpx;
  font-size: 26rpx; color: #666;
}

.card {
  background: #fff; border-radius: 20rpx;
  padding: 28rpx; margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 8rpx; }
.card-count { font-size: 24rpx; color: #999; }
.card-desc { font-size: 24rpx; color: #999; display: block; margin-bottom: 20rpx; }

.admin-list { display: flex; flex-direction: column; gap: 12rpx; }
.admin-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20rpx; background: #F8F8FA; border-radius: 16rpx;
}
.ai-left { display: flex; align-items: center; gap: 16rpx; }
.ai-avatar {
  width: 72rpx; height: 72rpx; border-radius: 50%;
  background: #F0F0F2; display: flex; align-items: center;
  justify-content: center; font-size: 32rpx; overflow: hidden;
}
.ai-avatar image { width: 100%; height: 100%; }
.ai-name { font-size: 28rpx; font-weight: 500; display: block; }
.ai-phone { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }
.ai-right { display: flex; align-items: center; gap: 12rpx; }
.ai-role {
  font-size: 22rpx; padding: 4rpx 12rpx;
  background: #E3F2FD; color: #1565C0; border-radius: 8rpx;
}
.btn-remove {
  background: none; border: 2rpx solid #D32F2F;
  color: #D32F2F; font-size: 22rpx; padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.add-form { margin-top: 20rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }
.add-row { display: flex; gap: 12rpx; align-items: center; }
.add-row .form-input { flex: 1; }
.add-row .btn-sm { padding: 14rpx 28rpx; font-size: 26rpx; white-space: nowrap; }

.help-text {
  font-size: 22rpx; color: #999; display: block; margin-top: 16rpx;
  line-height: 1.6;
}

.empty-sub { font-size: 24rpx; color: #bbb; display: block; margin-top: 8rpx; }

/* 权限列表 */
.perm-list { margin-top: 16rpx; }
.perm-item {
  display: flex; align-items: center; gap: 12rpx;
  padding: 14rpx 0;
}
.perm-icon { font-size: 24rpx; width: 40rpx; text-align: center; }
.perm-text { font-size: 26rpx; color: #555; }
.perm-divider {
  height: 2rpx; background: #F0F0F2; margin: 8rpx 0;
}

.wx-share-btn {
  width: 100%; height: 88rpx;
  background: #07C160; color: #fff;
  border: none; border-radius: 44rpx;
  font-size: 30rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  margin-top: 16rpx;
}

.history-item { display: flex; align-items: center; gap: 16rpx; padding: 16rpx; background: #F8F8FA; border-radius: 12rpx; margin-bottom: 10rpx; }
.hi-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; }
.hi-avatar-text { font-size: 32rpx; width: 64rpx; text-align: center; }
.hi-info { flex: 1; }
.hi-name { font-size: 26rpx; font-weight: 500; display: block; }
.hi-phone { font-size: 22rpx; color: #999; }
.hi-add { color: #FF6B35; font-size: 24rpx; font-weight: 500; }
</style>
