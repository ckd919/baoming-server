/**
 * API 请求层 — 小程序版
 * 后端地址需替换为你的域名
 */

const API_BASE = 'http://8.134.252.128/api'

function getToken() {
  return uni.getStorageSync('bm_token') || ''
}

export function setToken(token) {
  uni.setStorageSync('bm_token', token)
}

export function clearToken() {
  uni.removeStorageSync('bm_token')
  uni.removeStorageSync('bm_user')
}

async function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = API_BASE + path
    console.log('[API请求]', method, url, data)
    uni.request({
      url,
      method,
      header: {
        'Content-Type': 'application/json',
        'Authorization': getToken() ? `Bearer ${getToken()}` : ''
      },
      data,
      sslVerify: false,
      timeout: 30000,
      success(res) {
        console.log('[API响应]', res.statusCode, res.data)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error((res.data && res.data.error) || `请求失败(${res.statusCode})`))
        }
      },
      fail(err) {
        console.error('[API失败]', err)
        reject(new Error('网络请求失败: ' + (err.errMsg || JSON.stringify(err))))
      }
    })
  })
}

// ==================== 登录 ====================

/** 管理员登录：手机号 + 密码（开发测试用） */
export async function login(phone, password) {
  const data = await request('POST', '/auth/admin/login', { phone, password })
  setToken(data.token)
  uni.setStorageSync('bm_user', JSON.stringify(data.user))
  return data.user
}

/**
 * 微信授权登录（不强制手机号）
 * @param {Object} params - { code, nickname?, avatarUrl? }
 * 后端通过 code 换取 openid，自动创建/识别用户
 * 手机号可后续在个人中心绑定
 */
export async function wechatAuthLogin({ code, nickname, avatarUrl }) {
  const data = await request('POST', '/auth/wechat-login', {
    code,
    nickname: nickname || '微信用户',
    avatarUrl: avatarUrl || ''
  })
  setToken(data.token)
  uni.setStorageSync('bm_user', JSON.stringify(data.user))
  return data.user
}

/**
 * 绑定手机号（登录后可选操作）
 * @param {Object} params - { code, encryptedData, iv }
 * 使用微信 getPhoneNumber 获取的加密数据绑定手机号
 */
export async function bindPhone({ code, encryptedData, iv }) {
  const data = await request('POST', '/auth/bind-phone', {
    code,
    encryptedData,
    iv
  })
  uni.setStorageSync('bm_user', JSON.stringify(data.user))
  return data.user
}

// ==================== 用户信息 ====================
export async function getMyProfile() {
  const data = await request('GET', '/auth/me')
  uni.setStorageSync('bm_user', JSON.stringify(data.user))
  return data.user
}

export async function updateProfile(profileData) {
  const data = await request('PUT', '/auth/profile', profileData)
  uni.setStorageSync('bm_user', JSON.stringify(data.user))
  return data.user
}

// ==================== 活动 CRUD ====================
export async function getActivities(status = '', keyword = '') {
  const params = []
  if (status) params.push(`status=${status}`)
  if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`)
  const qs = params.length ? '?' + params.join('&') : ''
  const data = await request('GET', `/activities${qs}`)
  return data.activities
}

export async function getActivity(id) {
  const data = await request('GET', `/activities/${id}`)
  return data.activity
}

export async function createActivity(activityData) {
  await request('POST', '/activities', activityData)
  return activityData
}

export async function updateActivity(id, updates) {
  await request('PUT', `/activities/${id}`, updates)
}

export async function deleteActivity(id) {
  await request('DELETE', `/activities/${id}`)
}

export async function restoreActivity(id) {
  await request('POST', `/activities/${id}/restore`)
}

export async function duplicateActivity(id) {
  const data = await request('POST', `/activities/${id}/duplicate`)
  return data  // { ok: true, id: newId }
}

// ==================== 提交数据 ====================
export async function getPublicActivity(id) {
  const data = await request('GET', `/form/${id}`)
  return data.activity
}

export async function addSubmission(activityId, subData) {
  await request('POST', `/form/${activityId}/submit`, subData)
}

export async function getSubmissions(activityId) {
  const data = await request('GET', `/activities/${activityId}/submissions`)
  return data.submissions
}

export async function clearSubmissions(activityId) {
  await request('DELETE', `/activities/${activityId}/submissions`)
}

// ==================== 模板 ====================
export async function getTemplates(category = '') {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  const data = await request('GET', `/templates${qs}`)
  return data
}

// ==================== 管理员管理 ====================
export async function getActivityAdmins(activityId) {
  const data = await request('GET', `/activities/${activityId}/admins`)
  return data.admins || []
}

export async function addActivityAdmin(activityId, phone) {
  await request('POST', `/activities/${activityId}/admins`, { phone })
}

export async function removeActivityAdmin(activityId, userId) {
  await request('DELETE', `/activities/${activityId}/admins/${userId}`)
}

// ==================== 用户记录 ====================
export async function getManagedActivities() {
  const data = await request('GET', '/user/managed-activities')
  return data.activities || []
}

export async function getMySubmissions() {
  const data = await request('GET', '/user/submissions')
  return data.submissions || []
}

export async function cancelSubmission(submissionId) {
  await request('DELETE', `/submissions/${submissionId}/cancel`)
}
