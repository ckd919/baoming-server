/**
 * 数据存储层 — API 版本 (Java Spring Boot 后端)
 *
 * 支持管理员 (ADMIN) 和普通用户 (USER) 两种角色。
 * 管理员: 手机号+密码登录，可管理活动和查看报名数据。
 * 普通用户: 仅手机号登录（自动创建），可查看/取消自己的报名。
 */

const API_BASE = '/api';

// ==================== Token & User 管理 ====================

function getToken() {
  return localStorage.getItem('bm_token');
}

function setToken(token) {
  localStorage.setItem('bm_token', token);
}

function clearToken() {
  localStorage.removeItem('bm_token');
}

/** 统一请求封装 */
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || '请求失败');
  }
  return json;
}

// ==================== 用户登录（角色区分） ====================

/** 管理员登录：手机号 + 密码 */
export async function adminLogin(phone, password) {
  const data = await request('POST', '/auth/admin/login', { phone, password });
  setToken(data.token);
  localStorage.setItem('bm_user', JSON.stringify(data.user));
  return data.user;
}

/** 普通用户登录：仅手机号（无密码，新用户自动创建） */
export async function userPhoneLogin(phone) {
  const data = await request('POST', '/auth/user/login', { phone });
  setToken(data.token);
  localStorage.setItem('bm_user', JSON.stringify(data.user));
  return data;
}

export function getLoginUser() {
  try {
    return JSON.parse(localStorage.getItem('bm_user'));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken() && !!getLoginUser();
}

export function isAdmin() {
  const user = getLoginUser();
  return user && user.role === 'ADMIN';
}

export function isUser() {
  const user = getLoginUser();
  return user && user.role === 'USER';
}

export function logout() {
  clearToken();
  localStorage.removeItem('bm_user');
}

// ==================== 活动 CRUD（仅管理员） ====================

export async function getActivities(status = '', keyword = '') {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (keyword) params.set('keyword', keyword);
  const qs = params.toString();
  const data = await request('GET', `/activities${qs ? '?' + qs : ''}`);
  return data.activities;
}

export async function getActivity(id) {
  const data = await request('GET', `/activities/${id}`);
  return data.activity;
}

export async function createActivity(activityData) {
  const data = await request('POST', '/activities', activityData);
  return { ...activityData, id: data.id };
}

export async function updateActivity(id, updates) {
  await request('PUT', `/activities/${id}`, updates);
  return { id, ...updates };
}

export async function deleteActivity(id) {
  await request('DELETE', `/activities/${id}`);
}

export async function restoreActivity(id) {
  await request('POST', `/activities/${id}/restore`);
}

export async function permanentDeleteActivity(id) {
  await request('DELETE', `/activities/${id}/permanent`);
}

export async function batchExport(ids) {
  return await request('POST', '/activities/batch-export', { ids });
}

export async function updateActivityFields(activityId, fields) {
  await updateActivity(activityId, { fields });
}

// ==================== 模板接口（公开） ====================

export async function getTemplates(category = '') {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return await request('GET', `/templates${qs}`);
}

// ==================== 公开报名接口（无需登录） ====================

export async function getPublicActivity(activityId, token = '') {
  const qs = token ? `?token=${encodeURIComponent(token)}` : '';
  const data = await request('GET', `/form/${activityId}${qs}`);
  return data.activity;
}

/** 提交报名 — phone 必传，后端自动登录并创建用户 */
export async function addSubmission(activityId, phone, submissionData, token = '') {
  const body = { ...submissionData, phone, token };
  const data = await request('POST', `/form/${activityId}/submit`, body);
  // 后端返回 JWT token（自动登录），前端保存
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

// ==================== Token 管理接口 ====================

export async function regenerateToken(activityId) {
  const data = await request('POST', `/activities/${activityId}/regenerate-token`);
  return data.inviteToken;
}

// ==================== 报名数据管理（管理员） ====================

export async function getSubmissions(activityId) {
  const data = await request('GET', `/activities/${activityId}/submissions`);
  return data.submissions;
}

export async function clearSubmissions(activityId) {
  await request('DELETE', `/activities/${activityId}/submissions`);
}

// ==================== 用户自助服务 ====================

/** 获取我的报名记录 */
export async function getMySubmissions() {
  const data = await request('GET', '/user/submissions');
  return data.submissions;
}

/** 取消我的报名 */
export async function cancelSubmission(submissionId) {
  await request('DELETE', `/submissions/${submissionId}/cancel`);
}
