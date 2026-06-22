<template>
  <view class="page">
    <!-- 统计 -->
    <view class="stats-row">
      <view class="stat-card"><text class="stat-val">{{ submissions.length }}</text><text class="stat-lbl">报名人数</text></view>
      <view class="stat-card"><text class="stat-val">{{ fields.length }}</text><text class="stat-lbl">收集字段</text></view>
    </view>

    <!-- 空状态 -->
    <view v-if="submissions.length === 0" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无报名数据</text>
    </view>

    <!-- 表格 -->
    <view v-else class="card">
      <view class="table-wrap">
        <view class="table-row header">
          <text class="table-cell" style="width:80rpx">#</text>
          <text class="table-cell" style="width:200rpx">提交时间</text>
          <text class="table-cell" v-for="f in fields" :key="f.id">{{ f.label }}</text>
        </view>
        <view class="table-row" v-for="(s, i) in submissions" :key="s.id">
          <text class="table-cell" style="width:80rpx">{{ i + 1 }}</text>
          <text class="table-cell" style="width:200rpx;font-size:22rpx">{{ formatDate(s.submittedAt) }}</text>
          <text class="table-cell" v-for="f in fields" :key="f.id" style="font-size:22rpx">
            {{ formatVal(s.data[f.id]) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="fixed-bottom" v-if="submissions.length > 0">
      <button class="btn-outline" @click="exportCSV">📥 导出</button>
      <button class="btn-outline" style="color:#D32F2F;border-color:#D32F2F" @click="clearAll">🗑 清空</button>
    </view>
  </view>
</template>

<script>
import { getActivity, getSubmissions, clearSubmissions } from '@/store/api.js'

export default {
  data() {
    return {
      fields: [],
      submissions: []
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('bm_token')) { uni.reLaunch({ url: '/pages/login/login' }); return }
    if (options.id) this.loadData(options.id)
  },
  methods: {
    async loadData(activityId) {
      try {
        const [activity, submissions] = await Promise.all([
          getActivity(activityId),
          getSubmissions(activityId)
        ])
        this.fields = activity?.fields || []
        this.submissions = submissions || []
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    formatVal(val) {
      if (val === undefined || val === null || val === '') return '-'
      if (Array.isArray(val)) return val.join(', ')
      return String(val)
    },
    formatDate(ts) {
      if (!ts) return '-'
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    exportCSV() {
      const headers = ['序号', '提交时间', ...this.fields.map(f => f.label)]
      const rows = this.submissions.map((s, i) => {
        const row = [i + 1, this.formatDate(s.submittedAt)]
        this.fields.forEach(f => row.push(this.formatVal(s.data?.[f.id])))
        return row.join(',')
      })
      const csv = '﻿' + headers.join(',') + '\n' + rows.join('\n')
      // 小程序导出：复制到剪贴板
      uni.setClipboardData({ data: csv, success: () => uni.showToast({ title: '已复制，可粘贴到Excel' }) })
    },
    async clearAll() {
      const res = await new Promise(r => uni.showModal({
        title: '确认清空', content: '确定清空所有报名数据？不可恢复！',
        success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        const pages = getCurrentPages()
        const options = pages[pages.length - 1].options
        await clearSubmissions(options.id)
        this.submissions = []
        uni.showToast({ title: '已清空', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: '清空失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 140rpx; }

.stats-row { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.stat-card {
  flex: 1; background: #fff; border-radius: 16rpx;
  padding: 28rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.stat-val { display: block; font-size: 48rpx; font-weight: 700; color: #D4720D; }
.stat-lbl { font-size: 24rpx; color: #999; }

.table-wrap { overflow-x: auto; }
.table-row { display: flex; }
.table-row.header { background: #f5f3f0; font-weight: 600; }
.table-cell {
  padding: 16rpx 12rpx; font-size: 24rpx; border-bottom: 2rpx solid #f0ede9;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  min-width: 120rpx; max-width: 200rpx;
}

.fixed-bottom {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 16rpx; padding: 20rpx; background: #fff;
  border-top: 2rpx solid #f0ede9;
}
</style>
