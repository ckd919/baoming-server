<template>
  <view class="page">
    <!-- 头部 -->
    <view class="header">
      <view class="title">我的记录</view>
    </view>

    <!-- 分段切换 -->
    <view class="segment-bar">
      <view class="segment-item" v-for="seg in segments" :key="seg.key"
            :class="{ active: currentTab === seg.key }"
            @click="switchTab(seg.key)">
        {{ seg.label }}
      </view>
    </view>

    <!-- ========== 最近浏览 ========== -->
    <view v-if="currentTab === 'recent'" class="tab-content">
      <view v-if="recentViews.length === 0" class="empty-state">
        <text class="empty-icon">👀</text>
        <text class="empty-text">暂无浏览记录</text>
        <text class="empty-sub">浏览过的活动报名页会出现在这里</text>
      </view>
      <view v-else>
        <view class="record-card" v-for="item in recentViews" :key="item.id"
              @click="goForm(item.id)">
          <view class="rc-top">
            <view class="rc-info">
              <text class="rc-name">{{ item.name }}</text>
              <text class="rc-desc" v-if="item.description">{{ item.description }}</text>
            </view>
            <text class="rc-arrow">→</text>
          </view>
          <view class="rc-bottom">
            <text class="rc-time">🕐 浏览于 {{ formatTime(item.viewedAt) }}</text>
            <text class="rc-location" v-if="item.location">📍 {{ item.location }}</text>
          </view>
        </view>
        <view class="clear-btn" @click="clearRecent">
          <text>清空浏览记录</text>
        </view>
      </view>
    </view>

    <!-- ========== 我管理的 ========== -->
    <view v-if="currentTab === 'managed'" class="tab-content">
      <view v-if="managedLoading" class="empty-state">
        <text class="empty-icon">⏳</text>
        <text class="empty-text">加载中...</text>
      </view>
      <view v-else-if="managedList.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">还没有管理的活动</text>
        <text class="empty-sub">你创建的活动或被设为管理员的活动会出现在这里</text>
      </view>
      <view v-else>
        <view class="record-card" v-for="a in managedList" :key="a.id">
          <view class="rc-top">
            <view class="rc-info">
              <view class="rc-name-row">
                <text class="rc-name">{{ a.name }}</text>
                <text :class="'badge ' + (a.role === 'owner' ? 'badge-primary' : 'badge-info')">
                  {{ a.role === 'owner' ? '创建者' : '管理员' }}
                </text>
              </view>
              <view class="rc-meta">
                <text :class="'badge ' + statusClass(a.status)">{{ statusLabel(a.status) }}</text>
                <text class="meta-text">{{ a.submissionCount || 0 }}人报名</text>
              </view>
            </view>
            <text class="rc-arrow">→</text>
          </view>
          <view class="rc-actions">
            <button class="btn-outline btn-sm" @click.stop="goBuilder(a.id)">✏️ 编辑</button>
            <button class="btn-outline btn-sm" @click.stop="goData(a.id)">📊 数据</button>
            <button class="btn-outline btn-sm" @click.stop="goAdmins(a.id)">👥 管理员</button>
          </view>
        </view>
      </view>
    </view>

    <!-- ========== 我参与的 ========== -->
    <view v-if="currentTab === 'participated'" class="tab-content">
      <view v-if="participatedLoading" class="empty-state">
        <text class="empty-icon">⏳</text>
        <text class="empty-text">加载中...</text>
      </view>
      <view v-else-if="participatedList.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">还没有报名记录</text>
        <text class="empty-sub">你提交过的活动报名会出现在这里</text>
      </view>
      <view v-else>
        <view class="record-card" v-for="s in participatedList" :key="s.id">
          <view class="rc-top" @click="goForm(s.activityId)">
            <view class="rc-info">
              <text class="rc-name">{{ s.activityName || '未命名活动' }}</text>
              <text class="rc-time">📅 提交于 {{ formatTime(s.submittedAt) }}</text>
            </view>
            <text class="rc-arrow">→</text>
          </view>
          <view class="rc-actions" v-if="s.canCancel">
            <button class="btn-outline btn-sm" style="color:#D32F2F;border-color:#D32F2F"
                    @click.stop="handleCancel(s.id)">
              取消报名
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRecentViews, clearRecentViews } from '@/utils/recentViews.js'
import { getManagedActivities, getMySubmissions, cancelSubmission } from '@/store/api.js'

export default {
  data() {
    return {
      currentTab: 'recent',
      segments: [
        { key: 'recent', label: '最近浏览' },
        { key: 'managed', label: '我管理的' },
        { key: 'participated', label: '我参与的' }
      ],
      recentViews: [],
      managedList: [],
      managedLoading: false,
      participatedList: [],
      participatedLoading: false
    }
  },
  onShow() {
    this.loadRecentViews()
    this.loadManaged()
    this.loadParticipated()
  },
  methods: {
    switchTab(key) {
      this.currentTab = key
    },
    loadRecentViews() {
      this.recentViews = getRecentViews()
    },
    async loadManaged() {
      if (!uni.getStorageSync('bm_token')) return
      this.managedLoading = true
      try {
        this.managedList = await getManagedActivities()
      } catch (err) {
        console.error('加载管理的活动失败:', err)
      } finally {
        this.managedLoading = false
      }
    },
    async loadParticipated() {
      if (!uni.getStorageSync('bm_token')) return
      this.participatedLoading = true
      try {
        this.participatedList = await getMySubmissions()
      } catch (err) {
        console.error('加载报名记录失败:', err)
      } finally {
        this.participatedLoading = false
      }
    },
    clearRecent() {
      uni.showModal({
        title: '确认', content: '确定清空所有浏览记录？',
        success: res => {
          if (res.confirm) {
            clearRecentViews()
            this.loadRecentViews()
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },
    async handleCancel(submissionId) {
      const res = await new Promise(r => uni.showModal({
        title: '确认取消', content: '确定取消此报名？',
        success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        await cancelSubmission(submissionId)
        uni.showToast({ title: '已取消', icon: 'success' })
        this.loadParticipated()
      } catch (err) {
        uni.showToast({ title: '取消失败', icon: 'none' })
      }
    },
    goForm(id) {
      uni.navigateTo({ url: `/pages/form/form?id=${id}` })
    },
    goBuilder(id) {
      uni.navigateTo({ url: `/pages/builder/builder?id=${id}` })
    },
    goData(id) {
      uni.navigateTo({ url: `/pages/data/data?id=${id}` })
    },
    goAdmins(id) {
      uni.navigateTo({ url: `/pages/admins/admins?id=${id}` })
    },
    statusLabel(s) {
      return { published: '进行中', draft: '草稿', ended: '已截止' }[s] || s
    },
    statusClass(s) {
      return { published: 'badge-success', draft: 'badge-info', ended: '' }[s] || ''
    },
    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F6F3; padding-bottom: 20rpx; }

.header {
  background: linear-gradient(160deg, #D4720D, #B85D0A);
  color: #fff; padding: 40rpx 32rpx 30rpx;
}
.title { font-size: 40rpx; font-weight: 700; }

.tab-content { padding: 0 20rpx; }

.record-card {
  background: #fff; border-radius: 20rpx;
  padding: 24rpx 28rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.rc-top { display: flex; align-items: flex-start; justify-content: space-between; }
.rc-info { flex: 1; }
.rc-name { font-size: 30rpx; font-weight: 600; display: block; }
.rc-name-row { display: flex; align-items: center; gap: 12rpx; }
.rc-desc { font-size: 24rpx; color: #999; margin-top: 4rpx; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 500rpx; }
.rc-time { font-size: 24rpx; color: #999; margin-top: 6rpx; display: block; }
.rc-location { font-size: 22rpx; color: #999; margin-top: 4rpx; display: block; }
.rc-meta { display: flex; align-items: center; gap: 12rpx; margin-top: 8rpx; }
.meta-text { font-size: 24rpx; color: #999; }
.rc-arrow { font-size: 32rpx; color: #ccc; margin-top: 8rpx; }

.rc-bottom { margin-top: 12rpx; }
.rc-actions {
  display: flex; gap: 10rpx; margin-top: 16rpx;
  padding-top: 16rpx; border-top: 2rpx solid #f5f1ec;
}
.rc-actions .btn-sm { padding: 10rpx 20rpx; font-size: 24rpx; }

.clear-btn {
  text-align: center; padding: 24rpx;
  font-size: 26rpx; color: #999;
}
.empty-sub { font-size: 24rpx; color: #bbb; display: block; margin-top: 8rpx; }
</style>
