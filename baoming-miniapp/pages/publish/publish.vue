<template>
  <view class="page">
    <!-- 状态 -->
    <view class="status-card" v-if="activity">
      <text class="status-icon">{{ activity.status === 'published' ? '✅' : '📦' }}</text>
      <text class="status-text">{{ activity.status === 'published' ? '已发布' : '待发布' }}</text>
      <view class="stats">
        <view class="stat-item"><text class="stat-val">{{ (activity.fields && activity.fields.length) || 0 }}</text><text class="stat-lbl">字段</text></view>
        <view class="stat-item"><text class="stat-val">{{ activity.submissionCount || 0 }}</text><text class="stat-lbl">已报名</text></view>
        <view class="stat-item"><text class="stat-val">{{ activity.maxParticipants || '∞' }}</text><text class="stat-lbl">上限</text></view>
      </view>
    </view>

    <!-- 分享链接 -->
    <view class="card" v-if="activity">
      <text class="card-title">📎 报名链接</text>
      <view class="url-box">
        <text class="url-text">{{ formUrl }}</text>
        <button class="btn-outline btn-sm" @click="copyUrl">复制</button>
      </view>
      <view class="qr-wrap">
        <image :src="qrUrl" mode="widthFix" style="width:320rpx" />
      </view>
      <text class="hint">微信扫码即可报名</text>
    </view>

    <!-- 分享权限设置 -->
    <view class="card" v-if="activity">
      <text class="card-title">🔒 分享权限</text>
      <text class="card-desc">控制谁可以将此报名表分享给他人</text>

      <view class="share-level-list">
        <view class="share-level-item" v-for="opt in shareLevels" :key="opt.value"
              :class="{ selected: shareLevel === opt.value }"
              @click="setShareLevel(opt.value)">
          <view class="sl-left">
            <radio :checked="shareLevel === opt.value" color="#D4720D" />
            <view class="sl-info">
              <text class="sl-label">{{ opt.label }}</text>
              <text class="sl-desc">{{ opt.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <text class="hint" style="margin-top:16rpx">
        {{ shareLevelHint }}
      </text>
    </view>

    <!-- 群限制访问 -->
    <view class="card" v-if="activity">
      <text class="card-title">👥 群限制访问</text>
      <text class="card-desc">开启后，仅从微信群进入的用户可以填写，其他人打开会提示登录</text>
      <view class="flex-row">
        <text>仅限群成员填写</text>
        <switch :checked="groupRestricted" color="#D4720D"
                @change="toggleGroupRestricted" />
      </view>
    </view>

    <!-- 发布/取消发布 -->
    <view class="card" v-if="activity">
      <button v-if="activity.status !== 'published'" class="btn-primary btn-block" @click="publishNow">
        🚀 立即发布
      </button>
      <button v-else class="btn-block btn-secondary" @click="unpublish">
        取消发布
      </button>
    </view>

    <!-- 预览 -->
    <view class="card" v-if="activity">
      <button class="btn-outline btn-block" @click="previewForm">👁 预览报名表</button>
    </view>
  </view>
</template>

<script>
import { getActivity, updateActivity } from '@/store/api.js'

export default {
  data() {
    return {
      activity: null,
      shareLevel: 'all',
      groupRestricted: false,
      shareLevels: [
        {
          value: 'all',
          label: '所有人可分享',
          desc: '任何看到报名页的人都可以转发到微信群、朋友圈'
        },
        {
          value: 'admins',
          label: '创建者和管理员可分享',
          desc: '仅创建者和指定的管理员可以分享此报名表'
        },
        {
          value: 'creator',
          label: '仅创建者可分享',
          desc: '只有你自己可以分享，其他人无法转发'
        }
      ]
    }
  },
  computed: {
    formUrl() {
      if (!this.activity) return ''
      return `http://8.134.252.128/#/form/${this.activity.id}`
    },
    qrUrl() {
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(this.formUrl)}`
    },
    shareLevelHint() {
      const hints = {
        'all': '✅ 填写报名的人都可以将此活动分享给朋友',
        'admins': '🔒 只有你和指定的管理员可以分享，普通填写者无法转发',
        'creator': '🔒 仅你本人可以分享此报名链接'
      }
      return hints[this.shareLevel] || ''
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('bm_token')) {
      uni.switchTab({ url: '/pages/profile/profile' }); return
    }
    if (options.id) this.loadActivity(options.id)
  },
  methods: {
    async loadActivity(id) {
      try {
        this.activity = await getActivity(id)
        // 读取分享等级，兼容旧的 allowShare 字段
        if (this.activity.shareLevel) {
          this.shareLevel = this.activity.shareLevel
        } else if (this.activity.allowShare === false) {
          this.shareLevel = 'creator'
        } else {
          this.shareLevel = 'all'
        }
        this.groupRestricted = this.activity.groupRestricted || false
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    copyUrl() {
      uni.setClipboardData({ data: this.formUrl, success: () => uni.showToast({ title: '已复制' }) })
    },
    async setShareLevel(level) {
      this.shareLevel = level
      try {
        await updateActivity(this.activity.id, {
          shareLevel: level,
          allowShare: level !== 'creator'
        })
        this.activity.shareLevel = level
        this.activity.allowShare = level !== 'creator'
        uni.showToast({ title: '分享权限已更新', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: '设置失败', icon: 'none' })
      }
    },
    async toggleGroupRestricted(e) {
      const val = e.detail.value
      try {
        await updateActivity(this.activity.id, { groupRestricted: val })
        this.groupRestricted = val
        uni.showToast({ title: val ? '已开启群限制访问' : '已关闭群限制访问', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: '设置失败', icon: 'none' })
      }
    },
    async publishNow() {
      try {
        await updateActivity(this.activity.id, { status: 'published' })
        this.activity.status = 'published'
        uni.showToast({ title: '已发布', icon: 'success' })
      } catch (err) { uni.showToast({ title: '发布失败', icon: 'none' }) }
    },
    async unpublish() {
      const res = await new Promise(r => uni.showModal({
        title: '确认', content: '取消发布后，用户将无法报名', success: e => r(e.confirm)
      }))
      if (!res) return
      try {
        await updateActivity(this.activity.id, { status: 'draft' })
        this.activity.status = 'draft'
        uni.showToast({ title: '已取消', icon: 'success' })
      } catch (err) { uni.showToast({ title: '操作失败', icon: 'none' }) }
    },
    previewForm() {
      const id = this.activity?.id
      if (id) uni.navigateTo({ url: `/pages/form/form?id=${id}&preview=1` })
    }
  }
}
</script>

<style scoped>
.page { padding: 20rpx; padding-bottom: 40rpx; }

.status-card {
  text-align: center; background: #fff; border-radius: 20rpx;
  padding: 40rpx; margin-bottom: 20rpx;
}
.status-icon { font-size: 80rpx; }
.status-text { display: block; font-size: 32rpx; font-weight: 600; margin: 12rpx 0 20rpx; }
.stats { display: flex; justify-content: center; gap: 40rpx; }
.stat-val { display: block; font-size: 40rpx; font-weight: 700; color: #D4720D; }
.stat-lbl { font-size: 22rpx; color: #999; }

.card-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 8rpx; }
.card-desc { font-size: 24rpx; color: #999; display: block; margin-bottom: 20rpx; }

.url-box {
  display: flex; align-items: center; gap: 12rpx;
  background: #f5f3f0; padding: 16rpx; border-radius: 12rpx;
  word-break: break-all;
}
.url-text { flex: 1; font-size: 24rpx; color: #666; }
.qr-wrap { text-align: center; margin: 24rpx 0; }
.hint { font-size: 24rpx; color: #999; display: block; }

/* 分享等级选择 */
.share-level-list {
  display: flex; flex-direction: column; gap: 12rpx;
}
.share-level-item {
  padding: 20rpx 24rpx;
  background: #f9f8f6;
  border-radius: 16rpx;
  border: 3rpx solid transparent;
  transition: all 0.2s;
}
.share-level-item.selected {
  background: #FFF3E6;
  border-color: #D4720D;
}
.sl-left { display: flex; align-items: flex-start; gap: 16rpx; }
.sl-label { font-size: 28rpx; font-weight: 500; display: block; }
.sl-desc { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }

.btn-sm { padding: 12rpx 20rpx; font-size: 24rpx; flex-shrink: 0; }

.btn-secondary {
  background: #f5f5f5; color: #999; border: none;
  border-radius: 44rpx; font-size: 32rpx; font-weight: 600;
  padding: 24rpx 40rpx;
}
</style>
