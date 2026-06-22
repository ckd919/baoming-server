<script>
export default {
  globalData: {
    token: '',
    user: null,
    apiBase: 'http://8.134.252.128/api',
    groupId: ''   // 从微信群进入时的群openGId
  },
  onLaunch() {
    const token = uni.getStorageSync('bm_token')
    const user = uni.getStorageSync('bm_user')
    if (token) this.globalData.token = token
    if (user) {
      try {
        this.globalData.user = JSON.parse(user)
      } catch (e) {
        this.globalData.user = null
      }
    }

    // 获取微信群信息（用户从群聊进入时）
    // #ifdef MP-WEIXIN
    try {
      const launchOpts = uni.getEnterOptionsSync ? uni.getEnterOptionsSync() : {}
      // 当从小程序分享卡片进入且来自群聊时
      if (launchOpts.scene === 1044) {
        wx.getGroupEnterInfo({
          success: (res) => {
            this.globalData.groupId = res.openGId || ''
            console.log('群ID:', this.globalData.groupId)
          },
          fail: () => {}
        })
      }
    } catch (e) {}
    // #endif
  },

  // 全局方法：检查登录状态
  isLoggedIn() {
    return !!(this.globalData.token && this.globalData.user)
  },

  // 全局方法：获取当前用户
  getCurrentUser() {
    return this.globalData.user
  }
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  color: #1A1A1A;
  background: #F8F6F3;
  line-height: 1.6;
}

/* 主题色 */
$primary: #D4720D;
$primary-light: #FFF3E6;
$primary-gradient: linear-gradient(160deg, #D4720D, #B85D0A);
$text: #1A1A1A;
$text-secondary: #5F5F5F;
$text-hint: #9E9E9E;
$bg: #F8F6F3;
$border: #EBE7E2;
$radius: 16rpx;

/* 通用按钮 */
.btn-primary {
  background: linear-gradient(135deg, #D4720D, #E8892A);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  padding: 24rpx 40rpx;
}

.btn-outline {
  background: transparent;
  color: $primary;
  border: 2rpx solid $primary;
  border-radius: 44rpx;
  font-size: 28rpx;
  padding: 16rpx 32rpx;
}

.btn-block { width: 100%; }
.btn-sm { padding: 12rpx 24rpx; font-size: 24rpx; }

/* 卡片 */
.card {
  background: #fff;
  border-radius: $radius;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  background: #F9F8F6;
  border: 2rpx solid transparent;
  border-radius: 12rpx;
}
.form-input:focus { border-color: $primary; background: #fff; }

/* 标签 */
.badge {
  display: inline-block;
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  border-radius: 8rpx;
}
.badge-success { background: #E8F5E9; color: #2E7D32; }
.badge-warning { background: #FFF3E0; color: #ED6C02; }
.badge-info { background: #E3F2FD; color: #1565C0; }
.badge-primary { background: #FFF3E6; color: #D4720D; }

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
}
.empty-state .empty-icon { font-size: 100rpx; margin-bottom: 20rpx; opacity: 0.5; }
.empty-state .empty-text { font-size: 28rpx; color: $text-hint; }

/* 分段控制器 */
.segment-bar {
  display: flex;
  background: #f5f3f0;
  border-radius: 16rpx;
  padding: 6rpx;
  margin: 20rpx;
}
.segment-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 12rpx;
  transition: all 0.2s;
}
.segment-item.active {
  background: #fff;
  color: #D4720D;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

/* 头部渐变 */
.header-gradient {
  background: linear-gradient(160deg, #D4720D, #B85D0A);
  color: #fff;
  padding: 40rpx 32rpx 30rpx;
}
</style>
