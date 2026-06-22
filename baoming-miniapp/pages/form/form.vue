<template>
  <view class="page">
    <!-- 封面 -->
    <view class="cover" v-if="activity">
      <text class="cover-title">{{ activity.name }}</text>
      <text class="cover-desc" v-if="activity.description">{{ activity.description }}</text>
      <view class="cover-info" v-if="activity.startTime">
        <text>📅 {{ formatDate(activity.startTime) }}</text>
        <text v-if="activity.location">📍 {{ activity.location }}</text>
      </view>
      <!-- 分享权限提示 -->
      <view v-if="!canShare" class="share-badge">
        🔒 此报名表不可分享
      </view>
    </view>

    <!-- 状态提示 -->
    <view v-if="isPreview" class="tip-bar warning">⚠️ 预览模式 - 提交不会保存</view>
    <view v-if="isEnded" class="tip-bar error">🚫 活动暂未开放报名</view>
    <view v-if="isFull" class="tip-bar error">🚫 报名人数已满</view>

    <!-- 表单字段 -->
    <view class="form-body" v-if="activity && activity.fields">
      <view class="field-item" v-for="f in activity.fields" :key="f.id">
        <text class="field-label">{{ f.label }} <text v-if="f.required" style="color:#D32F2F">*</text></text>

        <!-- 姓名/文本/数字 -->
        <input v-if="['name','text','number'].includes(f.type)" class="form-input"
               v-model="formData[f.id]" :placeholder="f.placeholder || '请输入'"
               :type="f.type === 'number' ? 'number' : 'text'" />

        <!-- 多行文本 -->
        <textarea v-if="f.type === 'textarea'" class="form-textarea"
                  v-model="formData[f.id]" :placeholder="f.placeholder || '请输入'" />

        <!-- 日期/时间 -->
        <picker v-if="f.type === 'date'" mode="date" :value="formData[f.id]"
                @change="e => formData[f.id] = e.detail.value">
          <view class="picker-box">{{ formData[f.id] || '请选择日期' }}</view>
        </picker>
        <picker v-if="f.type === 'time'" mode="time" :value="formData[f.id]"
                @change="e => formData[f.id] = e.detail.value">
          <view class="picker-box">{{ formData[f.id] || '请选择时间' }}</view>
        </picker>

        <!-- 手机号/邮箱/身份证 -->
        <input v-if="['phone','email','idcard'].includes(f.type)" class="form-input"
               v-model="formData[f.id]" :placeholder="f.placeholder || '请输入'"
               :type="f.type === 'email' ? 'text' : 'text'"
               :maxlength="f.type === 'phone' ? 11 : (f.type === 'idcard' ? 18 : -1)" />

        <!-- 单选 -->
        <view v-if="f.type === 'radio'" class="option-group">
          <view class="option-item" v-for="opt in f.options" :key="opt"
                :class="{ selected: formData[f.id] === opt }"
                @click="formData[f.id] = opt">
            <radio :checked="formData[f.id] === opt" color="#D4720D" />
            <text>{{ opt }}</text>
          </view>
        </view>

        <!-- 多选 -->
        <view v-if="f.type === 'checkbox'" class="option-group">
          <view class="option-item" v-for="opt in f.options" :key="opt"
                @click="toggleCheck(f.id, opt)">
            <checkbox :checked="(formData[f.id]||[]).includes(opt)" color="#D4720D" />
            <text>{{ opt }}</text>
          </view>
        </view>

        <!-- 下拉 -->
        <picker v-if="f.type === 'select'" mode="selector"
                :range="f.options" @change="e => formData[f.id] = f.options[e.detail.value]">
          <view class="picker-box">{{ formData[f.id] || '请选择' }}</view>
        </picker>

        <!-- 图片上传 -->
        <view v-if="f.type === 'image'" class="img-upload">
          <view class="img-item" v-for="(img, ii) in (formData[f.id] || [])" :key="ii">
            <image :src="img" mode="aspectFill" class="img-thumb" />
            <button class="img-del" @click="removeImg(f.id, ii)">✕</button>
          </view>
          <view class="img-add" @click="uploadImg(f.id)" v-if="(formData[f.id]||[]).length < (f.maxImages || 9)">
            <text>+</text>
          </view>
        </view>

        <!-- 地理位置 -->
        <view v-if="f.type === 'location'" class="loc-box">
          <input class="form-input" v-model="formData[f.id]"
                 :placeholder="f.placeholder || '点击获取位置'" style="flex:1" />
          <button class="btn-outline btn-sm" @click="getLocation(f.id)">📍 定位</button>
        </view>

        <!-- 费用 -->
        <view v-if="f.type === 'fee'" class="fee-box">
          <text class="fee-symbol">¥</text>
          <text class="fee-val">{{ activity.fee || '0.00' }}</text>
        </view>
      </view>

      <button v-if="canSubmit" class="btn-primary btn-block" @click="submitForm"
              :loading="submitting" :disabled="submitting">
        📝 提交报名
      </button>
    </view>
  </view>
</template>

<script>
import { getPublicActivity, getActivity, addSubmission } from '@/store/api.js'
import { trackView } from '@/utils/recentViews.js'

export default {
  data() {
    return {
      activity: null,
      formData: {},
      submitting: false,
      isPreview: false,
      groupId: '',  // 微信群ID
      canShare: true  // 当前用户是否可分享
    }
  },
  computed: {
    isEnded() { return !this.isPreview && this.activity?.status !== 'published' },
    isFull() { return this.activity?.maxParticipants > 0 && this.activity?.submissionCount >= this.activity?.maxParticipants },
    canSubmit() { return this.activity?.fields?.length > 0 && !this.isEnded && !this.isFull && !this.isPreview },
    needLogin() { return this.activity?.groupRestricted || this.activity?.requireLogin }
  },
  onLoad(options) {
    if (options.id) {
      this.isPreview = options.preview === '1'
      this.getGroupInfo()
      // 先检查登录状态
      if (!this.isPreview) {
        const token = uni.getStorageSync('bm_token')
        if (!token) {
          // 暂存目标页面，登录后跳回
          uni.setStorageSync('bm_pending_form', options.id)
        }
      }
      this.loadActivity(options.id)
    }
  },
  // 控制分享：根据分享等级决定
  onShareAppMessage(res) {
    if (!this.activity) return { title: '', path: '' }

    const shareLevel = this.activity.shareLevel || (this.activity.allowShare === false ? 'creator' : 'all')

    // 'all' — 所有人都可以分享
    if (shareLevel === 'all') {
      return {
        title: this.activity.name || '活动报名',
        path: `/pages/form/form?id=${this.activity.id}`
      }
    }

    // 'admins' 或 'creator' — 公开页面上的普通用户不能分享
    // 管理员/创建者可以通过发布页的链接和二维码进行分享
    return { title: '', path: '' }
  },
  // 获取微信群信息
  getGroupInfo() {
    // #ifdef MP-WEIXIN
    try {
      const app = getApp()
      if (app.globalData && app.globalData.groupId) {
        this.groupId = app.globalData.groupId
        return
      }
      const scene = uni.getLaunchOptionsSync()
      if (scene && scene.referrerInfo && scene.referrerInfo.appId) {
        // 从群聊进入时，referrerInfo.extraData 可能包含群信息
      }
    } catch (e) { /* ignore */ }
    // #endif
  },
  methods: {
    async loadActivity(id) {
      try {
        if (this.isPreview) {
          this.activity = await getActivity(id)
        } else {
          this.activity = await getPublicActivity(id)
        }
        if (!this.activity) return

        // 群限制访问：必须登录
        if (!this.isPreview && this.needLogin) {
          const token = uni.getStorageSync('bm_token')
          if (!token) {
            uni.showModal({
              title: '需要登录',
              content: '此活动仅限群成员访问，请先微信授权登录',
              confirmText: '去登录',
              cancelText: '返回',
              success: res => {
                if (res.confirm) {
                  uni.setStorageSync('bm_pending_form', id)
                  uni.switchTab({ url: '/pages/profile/profile' })
                } else {
                  uni.navigateBack()
                }
              }
            })
            return
          }
        }

        // 判断分享权限
        const shareLevel = this.activity.shareLevel || (this.activity.allowShare === false ? 'creator' : 'all')
        this.canShare = shareLevel === 'all'

        // #ifdef MP-WEIXIN
        // 群限制访问：禁止转发
        if (this.activity.groupRestricted) {
          wx.hideShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
        } else if (!this.canShare) {
          wx.hideShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
        } else {
          wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
        }
        // #endif

        // 记录浏览（非预览模式下）
        if (!this.isPreview) {
          trackView(this.activity)
        }

        // 初始化表单数据
        (this.activity.fields || []).forEach(f => {
          this.formData[f.id] = f.type === 'checkbox' ? [] : ''
        })
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    toggleCheck(fid, opt) {
      const arr = this.formData[fid] || []
      const idx = arr.indexOf(opt)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(opt)
      this.$set(this.formData, fid, arr)
    },
    removeImg(fid, idx) {
      this.formData[fid].splice(idx, 1)
    },
    uploadImg(fid) {
      uni.chooseImage({
        count: 1, sizeType: ['compressed'],
        success: res => {
          const imgs = this.formData[fid] || []
          this.$set(this.formData, fid, [...imgs, res.tempFilePaths[0]])
        }
      })
    },
    getLocation(fid) {
      uni.getLocation({
        type: 'wgs84',
        success: pos => { this.formData[fid] = `${pos.latitude}, ${pos.longitude}` },
        fail: () => uni.showToast({ title: '定位失败', icon: 'none' })
      })
    },
    formatDate(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },
    async submitForm() {
      // 必填校验
      for (const f of (this.activity.fields || [])) {
        if (f.required) {
          const v = this.formData[f.id]
          if (!v || (Array.isArray(v) && v.length === 0)) {
            uni.showToast({ title: `请填写「${f.label}」`, icon: 'none' })
            return
          }
        }
      }

      this.submitting = true
      try {
        const subData = {
          id: Date.now().toString(36),
          data: this.formData,
          submittedAt: Date.now()
        }
        // 带群ID（如有）
        if (this.groupId) subData.groupId = this.groupId
        await addSubmission(this.activity.id, subData)
        uni.showToast({ title: '报名成功', icon: 'success' })
        this.submitting = false
      } catch (err) {
        uni.showToast({ title: '提交失败: ' + err.message, icon: 'none' })
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F8F6F3; padding-bottom: 60rpx; }

.cover {
  background: linear-gradient(160deg, #D4720D, #B85D0A);
  color: #fff; padding: 60rpx 40rpx; text-align: center;
  position: relative;
}
.cover-title { font-size: 38rpx; font-weight: 700; }
.cover-desc { font-size: 26rpx; opacity: 0.8; margin-top: 12rpx; }
.cover-info { display: flex; gap: 24rpx; justify-content: center; font-size: 24rpx; opacity: 0.7; margin-top: 16rpx; }

.share-badge {
  margin-top: 16rpx;
  display: inline-block;
  padding: 6rpx 20rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 20rpx;
  font-size: 22rpx;
}

.tip-bar { padding: 16rpx; text-align: center; font-size: 26rpx; }
.tip-bar.warning { background: #FFF3E0; color: #ED6C02; }
.tip-bar.error { background: #FFEBEE; color: #D32F2F; }

.form-body { padding: 28rpx; }
.field-item { margin-bottom: 32rpx; }
.field-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 12rpx; }

.form-textarea { width: 100%; min-height: 160rpx; padding: 20rpx; background: #f9f8f6; border-radius: 12rpx; font-size: 28rpx; }

.picker-box { padding: 20rpx 28rpx; background: #f9f8f6; border-radius: 12rpx; font-size: 28rpx; color: #666; }

.option-group { display: flex; flex-direction: column; gap: 16rpx; }
.option-item { display: flex; align-items: center; gap: 16rpx; padding: 20rpx 24rpx; background: #f9f8f6; border-radius: 12rpx; }
.option-item.selected { background: #FFF3E6; }

.img-upload { display: flex; flex-wrap: wrap; gap: 12rpx; }
.img-thumb { width: 140rpx; height: 140rpx; border-radius: 12rpx; }
.img-item { position: relative; }
.img-del {
  position: absolute; top: 4rpx; right: 4rpx;
  width: 36rpx; height: 36rpx; background: rgba(0,0,0,0.5);
  color: #fff; border-radius: 50%; font-size: 20rpx;
  border: none; display: flex; align-items: center; justify-content: center;
}
.img-add {
  width: 140rpx; height: 140rpx; border: 3rpx dashed #ddd;
  border-radius: 12rpx; display: flex; align-items: center;
  justify-content: center; font-size: 48rpx; color: #999;
}

.loc-box { display: flex; gap: 12rpx; }
.fee-box { display: flex; align-items: center; gap: 8rpx; padding: 20rpx; background: #FFF3E6; border-radius: 12rpx; }
.fee-symbol { font-size: 28rpx; color: #D4720D; font-weight: 600; }
.fee-val { font-size: 40rpx; color: #D4720D; font-weight: 700; }
.btn-sm { padding: 12rpx 20rpx; font-size: 24rpx; }
</style>
