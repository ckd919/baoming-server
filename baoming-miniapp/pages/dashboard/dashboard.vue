<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="greeting">👋 欢迎回来</view>
      <view class="title">小棕熊预约报名</view>
    </view>

    <!-- 搜索 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input v-model="searchKeyword" placeholder="搜索活动名称..."
             @input="filterActivities" />
    </view>

    <!-- 状态切换 -->
    <scroll-view scroll-x class="tab-scroll">
      <view class="tab-item" v-for="tab in tabs" :key="tab.key"
            :class="{ active: currentTab === tab.key }"
            @click="switchTab(tab.key)">
        {{ tab.label }}
      </view>
    </scroll-view>

    <!-- 活动列表 -->
    <view v-if="loading" class="empty-state">
      <text class="empty-icon">⏳</text>
      <text class="empty-text">加载中...</text>
    </view>

    <view v-else-if="filteredList.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">{{ searchKeyword ? '未找到匹配的活动' : '还没有活动，点击下方 + 创建' }}</text>
    </view>

    <view v-else class="list-wrap">
      <view class="activity-card" v-for="a in filteredList" :key="a.id">
        <view class="card-top">
          <view class="card-info" @click="goPage('/pages/builder/builder', { id: a.id })">
            <text class="activity-name">{{ a.name }}</text>
            <view class="card-meta">
              <text :class="'badge ' + statusClass(a.status)">{{ statusLabel(a.status) }}</text>
              <text class="meta-text">{{ a.submissionCount || 0 }}人报名</text>
            </view>
          </view>
        </view>

        <!-- 进度条 -->
        <view v-if="a.maxParticipants > 0" class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPct(a) + '%' }"></view>
        </view>

        <view class="card-info-row">
          <text>📅 {{ formatDate(a.startTime) }}</text>
          <text>📝 {{ (a.fields||[]).length }}字段</text>
          <text v-if="a.location">📍 {{ a.location }}</text>
        </view>

        <view class="card-actions">
          <button class="btn-outline btn-sm" @click.stop="goPage('/pages/create/create', { id: a.id })">✏️ 编辑</button>
          <button class="btn-outline btn-sm" @click.stop="goPage('/pages/builder/builder', { id: a.id })">📝 表单</button>
          <button class="btn-outline btn-sm" @click.stop="goPage('/pages/publish/publish', { id: a.id })">🚀 发布</button>
          <button class="btn-outline btn-sm" @click.stop="goPage('/pages/data/data', { id: a.id })">📊 数据</button>
          <button v-if="a.status === 'published'" class="btn-outline btn-sm" style="color:#D32F2F;border-color:#D32F2F" @click.stop="handleStop(a.id)">🛑 截止</button>
          <button v-if="a.status === 'ended'" class="btn-outline btn-sm" style="color:#4CAF50;border-color:#4CAF50" @click.stop="handleRestart(a.id)">▶️ 开启</button>
          <button class="btn-outline btn-sm" @click.stop="goPage('/pages/admins/admins', { id: a.id })">👥 管理员</button>
          <button class="btn-outline btn-sm" @click.stop="handleCopy(a)">📋 复制</button>
          <button class="btn-delete" @click.stop="handleDelete(a.id)">🗑</button>
        </view>
      </view>

      <!-- 底部留白（给FAB让位） -->
      <view style="height:120rpx"></view>
    </view>

    <!-- 浮动创建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
import { getActivities, deleteActivity, duplicateActivity, stopRegistration, restartRegistration } from '@/store/api.js'

export default {
  data() {
    return {
      activities: [],
      searchKeyword: '',
      currentTab: 'all',
      loading: true,
      tabs: [
        { key: 'all', label: '全部' },
        { key: 'published', label: '进行中' },
        { key: 'draft', label: '草稿' },
        { key: 'ended', label: '已截止' },
      ]
    }
  },
  computed: {
    filteredList() {
      let list = this.activities
      if (this.currentTab !== 'all') {
        list = list.filter(a => a.status === this.currentTab)
      }
      if (this.searchKeyword) {
        const kw = this.searchKeyword.toLowerCase()
        list = list.filter(a => a.name.toLowerCase().includes(kw))
      }
      return list
    }
  },
  onShow() {
    if (!uni.getStorageSync('bm_token')) {
      // 未登录，跳转到个人中心tab进行登录
      uni.switchTab({ url: '/pages/profile/profile' })
      return
    }
    this.loadActivities()
  },
  methods: {
    async loadActivities() {
      this.loading = true
      try {
        this.activities = await getActivities()
      } catch (err) {
        uni.showToast({ title: '加载失败: ' + err.message, icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    switchTab(key) { this.currentTab = key },
    filterActivities() {},
    goCreate() {
      uni.navigateTo({ url: '/pages/create/create' })
    },
    goPage(url, params = {}) {
      const qs = Object.entries(params).map(([k,v]) => `${k}=${v}`).join('&')
      uni.navigateTo({ url: qs ? `${url}?${qs}` : url })
    },
    statusLabel(s) {
      return { published: '进行中', draft: '草稿', ended: '已截止' }[s] || s
    },
    statusClass(s) {
      return { published: 'badge-success', draft: 'badge-info', ended: '' }[s] || ''
    },
    progressPct(a) {
      if (!a.maxParticipants || !a.submissionCount) return 0
      return Math.min(100, Math.round(a.submissionCount / a.maxParticipants * 100))
    },
    formatDate(ts) {
      if (!ts) return '未设置'
      const d = new Date(ts)
      return `${d.getMonth()+1}月${d.getDate()}日`
    },
    async handleStop(id) {
      const res = await new Promise(r => uni.showModal({
        title: '确认截止', content: '截止后报名将立即关闭，确定吗？',
        confirmText: '确定截止', success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        await stopRegistration(id)
        uni.showToast({ title: '已截止', icon: 'success' })
        this.loadActivities()
      } catch (err) { uni.showToast({ title: '操作失败', icon: 'none' }) }
    },
    async handleRestart(id) {
      const res = await new Promise(r => uni.showModal({
        title: '确认开启', content: '将恢复报名，确定吗？',
        confirmText: '确定开启', success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        await restartRegistration(id)
        uni.showToast({ title: '已开启', icon: 'success' })
        this.loadActivities()
      } catch (err) { uni.showToast({ title: '操作失败', icon: 'none' }) }
    },
    async handleCopy(activity) {
      const res1 = await new Promise(r => {
        uni.showModal({
          title: '复制活动',
          content: `确定复制「${activity.name}」吗？`,
          confirmText: '复制',
          success: e => r(e.confirm)
        })
      })
      if (!res1) return

      const res2 = await new Promise(r => {
        uni.showModal({
          title: '同时复制管理员？',
          content: '是否复制该活动的管理员绑定到新活动？',
          confirmText: '一起复制',
          cancelText: '不复制',
          success: e => r(e.confirm)
        })
      })
      try {
        await duplicateActivity(activity.id, res2)
        uni.showToast({ title: '复制成功', icon: 'success' })
        this.loadActivities()
      } catch (err) {
        uni.showToast({ title: '复制失败: ' + err.message, icon: 'none' })
      }
    },
    async handleDelete(id) {
      const res = await new Promise(r => uni.showModal({ title: '确认删除', content: '确定要删除这个活动吗？', success: e => r(e.confirm) }))
      if (!res) return
      try {
        await deleteActivity(id)
        uni.showToast({ title: '已删除', icon: 'success' })
        this.loadActivities()
      } catch (err) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page { padding-bottom: 40rpx; }

.header {
  background: linear-gradient(160deg, #FF6B35, #E55A2B);
  color: #fff; padding: 40rpx 32rpx 30rpx;
}
.greeting { font-size: 24rpx; opacity: 0.8; }
.title { font-size: 40rpx; font-weight: 700; margin-top: 8rpx; }

.search-bar {
  display: flex; align-items: center; gap: 12rpx;
  background: #fff; padding: 8rpx 20rpx; margin: 20rpx;
  border-radius: 40rpx;
}
.search-bar input { flex: 1; font-size: 28rpx; height: 64rpx; }

.tab-scroll {
  white-space: nowrap; padding: 0 20rpx 16rpx;
  background: #fff; border-bottom: 2rpx solid #F0F0F2;
}
.tab-item {
  display: inline-block; padding: 16rpx 28rpx;
  font-size: 28rpx; color: #666;
}
.tab-item.active { color: #FF6B35; font-weight: 600; }

.list-wrap { padding: 0 20rpx; }

.activity-card {
  background: #fff; border-radius: 20rpx;
  padding: 28rpx; margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-info { flex: 1; }
.activity-name { font-size: 32rpx; font-weight: 600; }
.card-meta { display: flex; align-items: center; gap: 12rpx; margin-top: 8rpx; }
.meta-text { font-size: 24rpx; color: #999; }

.progress-bar {
  height: 6rpx; background: #F0F0F2; border-radius: 3rpx;
  margin: 16rpx 0; overflow: hidden;
}
.progress-fill {
  height: 6rpx; background: linear-gradient(90deg, #FF6B35, #FF8C5A);
  border-radius: 3rpx; transition: width 0.5s;
}

.card-info-row {
  display: flex; flex-wrap: wrap; gap: 16rpx; font-size: 24rpx; color: #999;
  margin-bottom: 16rpx;
}

.card-actions {
  display: flex; flex-wrap: wrap; gap: 10rpx;
  padding-top: 18rpx; border-top: 2rpx solid #F5F5F7;
}
.card-actions .btn-sm { flex-shrink: 0; }
.btn-delete { background: none; border: none; font-size: 24rpx; padding: 8rpx 12rpx; color: #999; }

/* FAB */
.fab {
  position: fixed; bottom: 120rpx; right: 40rpx;
  width: 100rpx; height: 100rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(212, 114, 13, 0.35);
  z-index: 50;
}
.fab-icon { font-size: 56rpx; color: #fff; line-height: 1; }
</style>
