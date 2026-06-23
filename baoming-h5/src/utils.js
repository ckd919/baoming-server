/**
 * 工具函数模块
 * 包含：验证、格式化、Toast 提示、Modal 弹窗 等通用工具
 */

// ==================== Toast 提示 ====================
let toastTimer = null;

export function showToast(msg, duration = 2000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ==================== Modal 弹窗 ====================
// 返回 modal 容器 DOM，调用 .remove() 关闭
export function showModal({ title = '', content = '', footer = null } = {}) {
  // 先关闭已有弹窗
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'current-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  let footerHTML = '';
  if (footer) {
    footerHTML = `<div class="mt-16">${footer}</div>`;
  }

  modalContent.innerHTML = `
    <div class="modal-header">
      <span class="modal-title">${title}</span>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <div class="modal-body">${content}</div>
    ${footerHTML}
  `;

  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);

  // 绑定关闭事件
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  return modalContent;
}

export function closeModal() {
  const existing = document.getElementById('current-modal');
  if (existing) existing.remove();
}

// ==================== 校验工具 ====================

/** 手机号校验 */
export function isValidPhone(val) {
  return /^1[3-9]\d{9}$/.test(val);
}

/** 邮箱校验 */
export function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/** 中文姓名校验 (简体中文，2-20个字符，支持间隔号·) */
export function isValidChineseName(val) {
  return /^[一-龥·]{2,20}$/.test(val);
}

/** 身份证校验 */
export function isValidIdCard(val) {
  // 长度校验
  if (!/^\d{17}[\dXx]$/.test(val)) return false;
  // 校验位算法
  const weights = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
  const checkCodes = ['1','0','X','9','8','7','6','5','4','3','2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(val[i]) * weights[i];
  }
  return checkCodes[sum % 11] === val[17].toUpperCase();
}

// ==================== 日期/时间 ====================

/** 格式化时间戳为 yyyy-MM-dd HH:mm */
export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 格式化时间戳为 yyyy-MM-dd */
export function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/** 获取当前时间戳 */
export function now() {
  return Date.now();
}

// ==================== 随机ID ====================
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ==================== URL参数解析 ====================
export function getUrlParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/** 从 hash URL 中解析查询参数（如 #/form/abc?token=xyz） */
export function getHashParam(key) {
  const hash = window.location.hash.replace('#', '');
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get(key);
}

// ==================== 深拷贝 (简单版本) ====================
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ==================== 防抖 ====================
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ==================== CSV 导出 ====================
export function exportCSV(headers, rows, filename = 'data.csv') {
  const BOM = '﻿'; // 支持中文
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    headers.map(h => {
      let val = (row[h] ?? '').toString();
      // 包含逗号或引号时转义
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  );
  const csv = BOM + [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
