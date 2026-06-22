<template>
  <view class="page">
    <view class="card">
      <view class="form-group">
        <text class="form-label">活动名称 <text style="color:#D32F2F">*</text></text>
        <input class="form-input" v-model="form.name" placeholder="例如：2024年度技术分享会" />
      </view>

      <view class="form-group">
        <text class="form-label">活动描述</text>
        <textarea class="form-textarea" v-model="form.description" placeholder="活动介绍、参与须知..." />
      </view>

      <view class="form-group">
        <text class="form-label">活动地点</text>
        <input class="form-input" v-model="form.location" placeholder="例如：XX市XX路XX号" />
      </view>
    </view>

    <view class="card">
      <text class="card-title">时间设置</text>
      <view class="form-group">
        <text class="form-label">报名开始时间</text>
        <picker mode="date" @change="e => form.startTime = e.detail.value">
          <view class="picker-box">{{ form.startTime || '请选择' }}</view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">报名截止时间</text>
        <picker mode="date" @change="e => form.endTime = e.detail.value">
          <view class="picker-box">{{ form.endTime || '请选择' }}</view>
        </picker>
      </view>
    </view>

    <view class="card">
      <text class="card-title">报名限制</text>
      <view class="form-group">
        <text class="form-label">最大报名人数（0=不限）</text>
        <input class="form-input" v-model.number="form.maxParticipants" type="number" placeholder="0" />
      </view>
    </view>

    <!-- 模板选择 -->
    <view class="card">
      <text class="card-title mb-16">选择模板（可选）</text>
      <scroll-view scroll-x class="tpl-scroll">
        <view class="tpl-card" v-for="tpl in templates" :key="tpl.id"
              :class="{ selected: selectedTpl === tpl.id }"
              @click="selectedTpl = tpl.id">
          <text class="tpl-icon">{{ tpl.icon }}</text>
          <text class="tpl-name">{{ tpl.name }}</text>
          <text class="tpl-fields">{{ (tpl.fields && tpl.fields.length) || 0 }}个字段</text>
        </view>
      </scroll-view>
    </view>

    <button class="btn-primary btn-block" @click="handleCreate" :loading="loading" :disabled="loading">
      {{ loading ? '创建中...' : '创建活动 → 设置表单' }}
    </button>
  </view>
</template>

<script>
import { createActivity, getTemplates } from '@/store/api.js'

export default {
  data() {
    return {
      form: { name: '', description: '', location: '', startTime: '', endTime: '', maxParticipants: 0 },
      templates: [],
      selectedTpl: '',
      loading: false
    }
  },
  onShow() {
    if (!uni.getStorageSync('bm_token')) { uni.reLaunch({ url: '/pages/login/login' }); return }
    this.loadTemplates()
  },
  methods: {
    async loadTemplates() {
      try { const data = await getTemplates(); this.templates = data.templates || [] }
      catch { /* ignore */ }
    },
    async handleCreate() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入活动名称', icon: 'none' }); return
      }
      this.loading = true
      try {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
        let fields = []
        if (this.selectedTpl) {
          const tpl = this.templates.find(t => t.id === this.selectedTpl)
          if (tpl) {
            fields = (tpl.fields || []).map(f => ({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              type: f.type, label: f.label, placeholder: '', required: f.required || false,
              options: f.options ? [...f.options] : [], maxImages: f.maxImages || 9
            }))
          }
        }
        await createActivity({
          id, name: this.form.name, description: this.form.description,
          location: this.form.location,
          startTime: this.form.startTime ? new Date(this.form.startTime).getTime() : null,
          endTime: this.form.endTime ? new Date(this.form.endTime).getTime() : null,
          maxParticipants: this.form.maxParticipants || 0,
          status: 'draft', fields, createdAt: Date.now()
        })
        uni.showToast({ title: '创建成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: `/pages/builder/builder?id=${id}` })
        }, 500)
      } catch (err) {
        uni.showToast({ title: '创建失败: ' + err.message, icon: 'none' })
      } finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 60rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }
.form-textarea { width: 100%; min-height: 140rpx; padding: 20rpx; background: #f9f8f6; border-radius: 12rpx; font-size: 28rpx; }
.picker-box { padding: 20rpx 28rpx; background: #f9f8f6; border-radius: 12rpx; font-size: 28rpx; color: #666; }
.card-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 20rpx; }

.tpl-scroll { white-space: nowrap; }
.tpl-card {
  display: inline-block; width: 180rpx; text-align: center;
  padding: 24rpx 16rpx; background: #f9f8f6; border-radius: 16rpx;
  margin-right: 16rpx; border: 3rpx solid transparent;
}
.tpl-card.selected { border-color: #D4720D; background: #FFF3E6; }
.tpl-icon { display: block; font-size: 48rpx; margin-bottom: 8rpx; }
.tpl-name { font-size: 26rpx; font-weight: 500; }
.tpl-fields { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.btn-block { margin-top: 20rpx; }
</style>
