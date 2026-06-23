<template>
  <view class="page">
    <view class="card">
      <view class="title">用户服务协议及隐私政策</view>
      <view class="update-time">更新日期：2026年6月13日</view>
      <view class="section">
        <text class="section-title">一、引言</text>
        <text class="section-text">小棕熊预约报名（以下简称"本小程序"）非常重视用户的隐私和个人信息保护。本协议旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用本小程序前仔细阅读本协议，点击"同意"即表示您已充分理解并接受本协议全部内容。</text>
      </view>
      <view class="section">
        <text class="section-title">二、信息收集</text>
        <text class="section-text">本小程序仅在以下场景收集您的信息：\n\n1. 手机号码：用于登录认证和活动报名身份核验，收集方式为用户主动填写，仅管理员可见。\n\n2. 姓名/身份证号/邮箱等：根据活动管理员配置的报名表单字段收集，仅在用户主动提交报名时收集。</text>
      </view>
      <view class="section">
        <text class="section-title">三、信息使用目的</text>
        <text class="section-text">1. 活动报名管理：收集的信息用于活动组织者确认报名身份、联系参与者。\n\n2. 数据统计：仅管理员可查看汇总数据，用于活动管理。\n\n3. 不会用于任何商业营销或出售给第三方。</text>
      </view>
      <view class="section">
        <text class="section-title">四、数据存储与安全</text>
        <text class="section-text">1. 用户数据存储在云服务器PostgreSQL数据库中，采取加密传输（HTTPS）保护。\n\n2. 采用JWT令牌认证机制，确保数据访问安全。\n\n3. 管理员账号采用bcrypt密码哈希存储，保障账号安全。</text>
      </view>
      <view class="section">
        <text class="section-title">五、用户权利</text>
        <text class="section-text">1. 您有权拒绝提供非必填信息。\n\n2. 您可以联系管理员请求查看、更正或删除您的报名信息。\n\n3. 您可以随时停止使用本小程序。</text>
      </view>
      <view class="section">
        <text class="section-title">六、免责声明</text>
        <text class="section-text">本小程序仅作为活动报名信息收集工具。活动内容由管理员/发起人负责，本小程序不对活动本身的合法性、安全性承担责任。</text>
      </view>
      <view class="section">
        <text class="section-title">七、联系我们</text>
        <text class="section-text">如对本协议有任何疑问，请通过以下方式联系：\n邮箱：468356290@qq.com</text>
      </view>
      <view class="section">
        <text class="section-title">八、备案信息</text>
        <text class="section-text">ICP备案号：粤ICP备TBC号\n备案查询：http://beian.miit.gov.cn</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  onLoad() {
    uni.setNavigationBarTitle({ title: '隐私政策' })
  }
}
</script>

<style scoped>
.page { padding: 24rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 32rpx; }
.title { font-size: 36rpx; font-weight: 700; text-align: center; margin-bottom: 8rpx; }
.update-time { font-size: 24rpx; color: #999; text-align: center; margin-bottom: 32rpx; }
.section { margin-bottom: 28rpx; }
.section-title { display: block; font-size: 30rpx; font-weight: 600; margin-bottom: 10rpx; color: #FF6B35; }
.section-text { font-size: 26rpx; line-height: 1.8; color: #333; white-space: pre-line; }
</style>
