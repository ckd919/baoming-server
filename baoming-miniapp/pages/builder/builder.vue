<template>
  <view class="page">
    <view class="info-bar">📋 {{ (activity && activity.name) || '加载中...' }}</view>

    <!-- 字段分组 -->
    <scroll-view scroll-x class="group-scroll">
      <view class="group-tag" v-for="g in groups" :key="g.key"
            :class="{ active: activeGroup === g.key }" @click="activeGroup = g.key">
        {{ g.label }}
      </view>
    </scroll-view>

    <!-- 可选字段 -->
    <view class="field-grid">
      <view class="field-btn" v-for="ft in currentTypes" :key="ft.type"
            @click="addField(ft.type)">
        <text class="ft-icon">{{ ft.icon }}</text>
        <text class="ft-name">{{ ft.name }}</text>
      </view>
    </view>

    <!-- 已添加字段 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">表单字段 ({{ fields.length }})</text>
      </view>

      <view v-if="fields.length === 0" class="empty-state">
        <text class="empty-text">点击上方字段开始构建表单</text>
      </view>

      <view v-else class="field-card" v-for="(f, i) in fields" :key="f.id"
            @click="editField(f)">
        <view class="fc-header">
          <view class="fc-info">
            <text class="fc-label">{{ f.label }} <text v-if="f.required" style="color:#D32F2F">*</text></text>
            <text class="fc-type">{{ getTypeName(f.type) }} · 第{{ i + 1 }}项</text>
          </view>
          <view class="fc-actions">
            <button class="fc-btn" v-if="i > 0" @click.stop="moveField(i, -1)">⬆</button>
            <button class="fc-btn" v-if="i < fields.length - 1" @click.stop="moveField(i, 1)">⬇</button>
            <button class="fc-btn" @click.stop="removeField(i)">🗑</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 保存 -->
    <view class="fixed-bottom">
      <button class="btn-outline" @click="preview">👁 预览</button>
      <button class="btn-primary" @click="saveForm">💾 保存并发布</button>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal-overlay" v-if="editingField" @click="editingField = null">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑字段</text>
          <button class="modal-close" @click="editingField = null">✕</button>
        </view>
        <view class="form-group">
          <text class="form-label">字段标题</text>
          <input class="form-input" v-model="editingField.label" />
        </view>
        <view class="form-group">
          <text class="form-label">占位提示</text>
          <input class="form-input" v-model="editingField.placeholder" />
        </view>
        <view class="form-group flex-row">
          <text class="form-label">是否必填</text>
          <switch :checked="editingField.required" @change="editingField.required = $event.detail.value" color="#D4720D" />
        </view>
        <view v-if="hasOptions(editingField.type)" class="form-group">
          <text class="form-label">选项列表</text>
          <view v-for="(opt, oi) in editingField.options" :key="oi" class="option-row">
            <input class="form-input" v-model="editingField.options[oi]" style="flex:1" />
            <button class="fc-btn" @click="editingField.options.splice(oi, 1)">✕</button>
          </view>
          <button class="btn-outline btn-sm" @click="editingField.options.push('')">+ 添加选项</button>
        </view>
        <button class="btn-primary btn-block" @click="editingField = null">确认</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getActivity, updateActivity } from '@/store/api.js'

const FIELD_TYPES = {
  name: { icon: '👤', name: '姓名' },
  text: { icon: '📝', name: '单行文本' },
  textarea: { icon: '📄', name: '多行文本' },
  number: { icon: '🔢', name: '数字' },
  date: { icon: '📅', name: '日期' },
  time: { icon: '⏰', name: '时间' },
  radio: { icon: '🔘', name: '单选' },
  checkbox: { icon: '☑️', name: '多选' },
  select: { icon: '📋', name: '下拉选择' },
  phone: { icon: '📱', name: '手机号' },
  email: { icon: '📧', name: '邮箱' },
  idcard: { icon: '🪪', name: '身份证' },
  location: { icon: '📍', name: '地理位置' },
  image: { icon: '🖼️', name: '图片上传' },
  fee: { icon: '💰', name: '报名费用' },
}

const GROUPS = [
  { key: 'base', label: '基础', types: ['name','text','textarea','number'] },
  { key: 'choice', label: '选择', types: ['radio','checkbox','select'] },
  { key: 'date', label: '日期', types: ['date','time'] },
  { key: 'contact', label: '联系', types: ['phone','email','idcard','location'] },
  { key: 'media', label: '附件', types: ['image'] },
  { key: 'pay', label: '收款', types: ['fee'] },
]

export default {
  data() {
    return {
      activity: null,
      fields: [],
      activeGroup: 'base',
      groups: GROUPS,
      editingField: null
    }
  },
  computed: {
    currentTypes() {
      const g = GROUPS.find(g => g.key === this.activeGroup)
      if (!g) return []
      return g.types.map(t => ({ type: t, ...FIELD_TYPES[t] }))
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('bm_token')) { uni.reLaunch({ url: '/pages/login/login' }); return }
    if (options.id) this.loadActivity(options.id)
  },
  methods: {
    async loadActivity(id) {
      try {
        this.activity = await getActivity(id)
        this.fields = (this.activity.fields || []).map(f => ({
          id: f.id, type: f.type, label: f.label || '', placeholder: f.placeholder || '',
          required: f.required || false, options: [...(f.options || [])], maxImages: f.maxImages || 9
        }))
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    getTypeName(type) { return (FIELD_TYPES[type] || {}).name || type },
    hasOptions(type) { return ['radio','checkbox','select'].includes(type) },

    addField(type) {
      const def = FIELD_TYPES[type]
      if (!def) return
      this.fields.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type, label: def.name, placeholder: '', required: false,
        options: type === 'radio' ? ['选项一','选项二'] : (type === 'checkbox' ? ['选项一','选项二','选项三'] : (type === 'select' ? ['选项一','选项二'] : [])),
        maxImages: 9
      })
      uni.showToast({ title: `已添加「${def.name}」`, icon: 'none', duration: 1000 })
    },

    editField(f) { this.editingField = f },
    removeField(i) {
      uni.showModal({ title: '删除字段', content: `确定删除「${this.fields[i].label}」吗？`, success: res => {
        if (res.confirm) { this.fields.splice(i, 1); uni.showToast({ title: '已删除', icon: 'none' }) }
      }})
    },
    moveField(i, offset) {
      const ni = i + offset
      if (ni < 0 || ni >= this.fields.length) return
      const tmp = this.fields[i]; this.fields.splice(i, 1); this.fields.splice(ni, 0, tmp)
    },

    async saveForm() {
      try {
        await updateActivity(this.activity.id, { fields: this.fields.map(f => ({
          id: f.id, type: f.type, label: f.label, placeholder: f.placeholder,
          required: f.required, options: f.options, maxImages: f.maxImages
        })) })
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: `/pages/publish/publish?id=${this.activity.id}` })
        }, 500)
      } catch (err) {
        uni.showToast({ title: '保存失败: ' + err.message, icon: 'none' })
      }
    },

    preview() {
      const id = this.activity?.id
      if (id) uni.navigateTo({ url: `/pages/form/form?id=${id}&preview=1` })
    }
  }
}
</script>

<style scoped>
.page { padding-bottom: 160rpx; }
.info-bar { padding: 16rpx 28rpx; font-size: 24rpx; color: #999; background: #fff; }
.group-scroll { white-space: nowrap; padding: 16rpx 20rpx; background: #fff; }
.group-tag {
  display: inline-block; padding: 10rpx 24rpx; font-size: 26rpx;
  background: #f5f3f0; border-radius: 24rpx; margin-right: 12rpx; color: #666;
}
.group-tag.active { background: #FFF3E6; color: #D4720D; font-weight: 600; }

.field-grid {
  display: flex; flex-wrap: wrap; gap: 12rpx;
  padding: 20rpx; background: #fff; margin-bottom: 16rpx;
}
.field-btn {
  width: calc(25% - 9rpx); display: flex; flex-direction: column; align-items: center;
  padding: 20rpx 0; background: #f9f8f6; border-radius: 12rpx; font-size: 24rpx;
}
.ft-icon { font-size: 36rpx; }
.ft-name { color: #666; margin-top: 4rpx; }

.section { padding: 0 20rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; }

.field-card {
  background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 12rpx;
  border-left: 6rpx solid #D4720D; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.fc-header { display: flex; align-items: center; justify-content: space-between; }
.fc-label { font-size: 28rpx; font-weight: 500; }
.fc-type { font-size: 22rpx; color: #999; }
.fc-btn { background: none; border: none; font-size: 28rpx; padding: 8rpx; }

.fixed-bottom {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 16rpx; padding: 20rpx; background: #fff;
  border-top: 2rpx solid #f0ede9;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100;
  display: flex; align-items: flex-end;
}
.modal-content {
  width: 100%; max-height: 80vh; background: #fff;
  border-radius: 32rpx 32rpx 0 0; padding: 32rpx; overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28rpx; }
.modal-title { font-size: 34rpx; font-weight: 600; }
.modal-close { background: #f5f3f0; border: none; width: 56rpx; height: 56rpx; border-radius: 50%; }
.flex-row { display: flex; align-items: center; justify-content: space-between; }
.option-row { display: flex; align-items: center; gap: 8rpx; margin-bottom: 12rpx; }
.btn-sm { padding: 12rpx 24rpx; font-size: 24rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }
</style>
