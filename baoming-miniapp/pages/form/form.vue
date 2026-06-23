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

      <!-- 留言区 -->
      <view class="comment-section" v-if="activity">
        <text class="comment-title">💬 留言 ({{ comments.length }})</text>
        <view class="comment-item" v-for="c in comments" :key="c.id">
          <text class="ci-name">{{ c.nickname || '用户' }}</text>
          <text class="ci-content">{{ c.content }}</text>
          <text class="ci-time">{{ formatTime(c.createdAt) }}</text>
        </view>
        <view class="comment-input-row">
          <input class="form-input" v-model="newComment" placeholder="输入留言..." />
          <button class="btn-primary btn-sm" @click="handleAddComment">发送</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPublicActivity, getActivity, addSubmission, getComments, addComment } from '@/store/api.js'
import { trackView } from '@/utils/recentViews.js'

export default {
  data() {
    return {
      activity: null,
      formData: {},
      submitting: false,
      isPreview: false,
      groupId: '',
      canShare: true,
      comments: [],
      newComment: ''
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
  // 控制分享：创建者/管理员始终可分享，普通用户受限
  onShareAppMessage(res) {
    if (!this.activity) return { title: '', path: '' }

    // 创建者/管理员始终可分享
    if (this.canShare) {
      return {
        title: this.activity.name || '活动报名',
        path: `/pages/form/form?id=${this.activity.id}`
      }
    }

    return { title: '', path: '' }
  },
  methods: {
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

        // 判断当前用户身份
        const userStr = uni.getStorageSync('bm_user')
        let isCreator = false
        let isAdmin = this.activity.isAdmin || false
        if (userStr && this.activity.userId) {
          try {
            const user = JSON.parse(userStr)
            isCreator = (user.id === this.activity.userId)
          } catch (e) {}
        }

        // 分享权限规则：
        // "creator" → 仅创建者
        // "admins"  → 创建者 + 管理员
        // "all"     → 所有人
        const shareLevel = this.activity.shareLevel || (this.activity.allowShare === false ? 'creator' : 'all')
        if (shareLevel === 'creator') {
          this.canShare = isCreator                  // 仅创建者
        } else if (shareLevel === 'admins') {
          this.canShare = isCreator || isAdmin       // 创建者 + 管理员
        } else {
          this.canShare = true                        // 所有人
        }

        // #ifdef MP-WEIXIN
        if (this.canShare) {
          wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
        } else {
          wx.hideShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
        }
        // #endif

        // 记录浏览（非预览模式下）
        if (!this.isPreview) {
          trackView(this.activity)
          this.loadComments()
        }

        // 初始化表单数据，并从用户信息自动填充
        const userStr = uni.getStorageSync('bm_user')
        let userProfile = {}
        if (userStr) {
          try { userProfile = JSON.parse(userStr) } catch (e) {}
        }
        (this.activity.fields || []).forEach(f => {
          let val = f.type === 'checkbox' ? [] : ''
          // 快速填充：匹配字段类型
          if (f.type === 'name' && userProfile.realName) val = userProfile.realName
          else if (f.type === 'phone' && userProfile.phone) val = userProfile.phone
          else if (f.type === 'idcard' && userProfile.idCard) val = userProfile.idCard
          else if (f.type === 'email' && userProfile.email) val = userProfile.email || ''
          this.formData[f.id] = val
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
    },
    async loadComments() {
      try { this.comments = await getComments(this.activity.id) }
      catch { this.comments = [] }
    },
    async handleAddComment() {
      if (!this.newComment.trim()) return
      try {
        await addComment(this.activity.id, this.newComment.trim())
        this.newComment = ''
        this.loadComments()
      } catch (err) {
        uni.showToast({ title: '留言失败', icon: 'none' })
      }
    },
    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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

.comment-section { margin-top: 40rpx; padding-top: 28rpx; border-top: 2rpx solid #f0ede9; }
.comment-title { font-size: 28rpx; font-weight: 600; display: block; margin-bottom: 16rpx; }
.comment-item { padding: 16rpx 0; border-bottom: 1rpx solid #f5f1ec; }
.ci-name { font-size: 24rpx; color: #D4720D; font-weight: 500; display: block; }
.ci-content { font-size: 26rpx; color: #333; display: block; margin: 6rpx 0; }
.ci-time { font-size: 20rpx; color: #ccc; }
.comment-input-row { display: flex; gap: 12rpx; margin-top: 16rpx; align-items: center; }
.comment-input-row .form-input { flex: 1; }
.comment-input-row .btn-sm { padding: 14rpx 24rpx; white-space: nowrap; }
</style>
