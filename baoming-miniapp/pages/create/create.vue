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
        <view class="datetime-row">
          <picker mode="date" :value="startDate" @change="e => { startDate = e.detail.value; mergeStartTime() }">
            <view class="picker-box picker-half">{{ startDate || '选择日期' }}</view>
          </picker>
          <picker mode="time" :value="startTimeOnly" @change="e => { startTimeOnly = e.detail.value; mergeStartTime() }">
            <view class="picker-box picker-half">{{ startTimeOnly || '选择时间' }}</view>
          </picker>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">报名截止时间</text>
        <view class="datetime-row">
          <picker mode="date" :value="endDate" @change="e => { endDate = e.detail.value; mergeEndTime() }">
            <view class="picker-box picker-half">{{ endDate || '选择日期' }}</view>
          </picker>
          <picker mode="time" :value="endTimeOnly" @change="e => { endTimeOnly = e.detail.value; mergeEndTime() }">
            <view class="picker-box picker-half">{{ endTimeOnly || '选择时间' }}</view>
          </picker>
        </view>
      </view>
    </view>

    <view class="card">
      <text class="card-title">报名限制</text>
      <view class="form-group">
        <text class="form-label">最大报名人数（0=不限）</text>
        <input class="form-input" v-model.number="form.maxParticipants" type="number" placeholder="0" />
      </view>
    </view>

    <!-- 模板选择（仅新建时显示） -->
    <view class="card" v-if="!isEdit">
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

    <!-- 编辑模式：保存修改 -->
    <button v-if="isEdit" class="btn-primary btn-block" @click="handleSubmit" :loading="loading" :disabled="loading">
      {{ loading ? '保存中...' : '💾 保存修改' }}
    </button>

    <!-- 创建模式：暂存草稿 + 设置表单 -->
    <view v-else class="create-btns">
      <button class="btn-outline" style="flex:1" @click="handleSaveDraft" :loading="draftLoading" :disabled="draftLoading">
        {{ draftLoading ? '保存中...' : '📦 暂存草稿' }}
      </button>
      <button class="btn-primary" style="flex:1" @click="handleCreateAndBuild" :loading="loading" :disabled="loading">
        {{ loading ? '创建中...' : '📝 创建并设置表单' }}
      </button>
    </view>
  </view>
</template>

<script>
import { createActivity, getTemplates, getActivity, updateActivity } from '@/store/api.js'

export default {
  data() {
    return {
      isEdit: false,
      editId: '',
      form: { name: '', description: '', location: '', startTime: '', endTime: '', maxParticipants: 0 },
      startDate: '', startTimeOnly: '',
      endDate: '', endTimeOnly: '',
      templates: [],
      selectedTpl: '',
      loading: false,
      draftLoading: false
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('bm_token')) { uni.switchTab({ url: '/pages/profile/profile' }); return }
    if (options.id) {
      this.isEdit = true
      this.editId = options.id
      uni.setNavigationBarTitle({ title: '编辑活动' })
      this.loadActivity(options.id)
    } else {
      this.loadTemplates()
    }
  },
  methods: {
    async loadActivity(id) {
      try {
        const activity = await getActivity(id)
        this.form.name = activity.name || ''
        this.form.description = activity.description || ''
        this.form.location = activity.location || ''
        this.form.maxParticipants = activity.maxParticipants || 0
        // 解析时间
        if (activity.startTime) {
          const d = new Date(activity.startTime)
          this.startDate = this.toDateStr(d)
          this.startTimeOnly = this.toTimeStr(d)
          this.form.startTime = activity.startTime
        }
        if (activity.endTime) {
          const d = new Date(activity.endTime)
          this.endDate = this.toDateStr(d)
          this.endTimeOnly = this.toTimeStr(d)
          this.form.endTime = activity.endTime
        }
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    async loadTemplates() {
      try { const data = await getTemplates(); this.templates = data.templates || [] }
      catch { /* ignore */ }
    },
    toDateStr(d) {
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    },
    toTimeStr(d) {
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    mergeStartTime() {
      if (this.startDate && this.startTimeOnly) {
        this.form.startTime = new Date(this.startDate + 'T' + this.startTimeOnly).getTime()
      }
    },
    mergeEndTime() {
      if (this.endDate && this.endTimeOnly) {
        this.form.endTime = new Date(this.endDate + 'T' + this.endTimeOnly).getTime()
      }
    },
    /** 编辑模式保存 */
    async handleSubmit() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入活动名称', icon: 'none' }); return
      }
      this.loading = true
      try {
        await updateActivity(this.editId, {
          name: this.form.name, description: this.form.description,
          location: this.form.location,
          startTime: this.form.startTime || null,
          endTime: this.form.endTime || null,
          maxParticipants: this.form.maxParticipants || 0
        })
        uni.showToast({ title: '修改成功', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 500)
      } catch (err) {
        uni.showToast({ title: '修改失败: ' + err.message, icon: 'none' })
      } finally { this.loading = false }
    },

    /** 暂存草稿：保存并返回列表 */
    async handleSaveDraft() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入活动名称', icon: 'none' }); return
      }
      this.draftLoading = true
      try {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
        await createActivity({
          id, name: this.form.name, description: this.form.description,
          location: this.form.location,
          startTime: this.form.startTime || null,
          endTime: this.form.endTime || null,
          maxParticipants: this.form.maxParticipants || 0,
          status: 'draft', fields: [], createdAt: Date.now()
        })
        uni.showToast({ title: '已保存为草稿', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 500)
      } catch (err) {
        uni.showToast({ title: '保存失败: ' + err.message, icon: 'none' })
      } finally { this.draftLoading = false }
    },

    /** 创建并设置表单 */
    async handleCreateAndBuild() {
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
          startTime: this.form.startTime || null,
          endTime: this.form.endTime || null,
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
.datetime-row { display: flex; gap: 16rpx; }
.picker-half { flex: 1; }
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
.create-btns { display: flex; gap: 16rpx; margin-top: 20rpx; }
</style>
