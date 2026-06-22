/**
 * 我的报名 — 普通用户自助查看/取消报名
 */
import { showToast, formatDate } from '../utils.js';
import { getMySubmissions, cancelSubmission, isUser, getLoginUser, logout } from '../store.js';
import { navigate } from '../router.js';

export function renderMyRegistrations() {
  if (!isUser()) { navigate('#/login'); return () => {}; }

  const user = getLoginUser();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="navbar">
      <span class="navbar-title">📋 我的报名</span>
      <span class="navbar-action" id="logout-btn" style="font-size:12px;color:#999">退出</span>
    </div>

    <div class="page" style="padding-top:12px">
      <div class="user-info-bar">
        <span>📱 ${user?.phone || ''}</span>
        <span class="badge badge-primary">普通用户</span>
      </div>

      <div id="submissions-list">
        <div class="text-center text-hint" style="padding:24px">加载中...</div>
      </div>
    </div>

    <div class="tabbar">
      <div class="tabbar-item active" data-nav="registrations">
        <span class="tab-icon">📋</span><span class="tab-label">我的报名</span></div>
      <div class="tabbar-item" data-nav="about">
        <span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
    navigate('#/login');
  });

  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const item = e.target.closest('.tabbar-item');
    if (!item) return;
    if (item.dataset.nav === 'registrations') navigate('#/my-registrations');
    if (item.dataset.nav === 'about') navigate('#/about');
  });

  loadMySubmissions();
  return () => {};
}

async function loadMySubmissions() {
  const container = document.getElementById('submissions-list');
  try {
    const submissions = await getMySubmissions();

    if (!submissions || submissions.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding-top:60px">
          <div class="empty-icon">📭</div>
          <div class="empty-title">暂无报名记录</div>
          <div class="empty-text">您还没有报名过任何活动</div>
        </div>`;
      return;
    }

    container.innerHTML = submissions.map(sub => `
      <div class="submission-card" id="sub-${sub.id}">
        <div class="submission-header">
          <div class="submission-activity-name">${escHtml(sub.activityName)}</div>
          ${sub.canCancel
            ? '<span class="badge badge-success">已报名</span>'
            : '<span class="badge" style="background:#f5f5f5;color:#999">已结束</span>'}
        </div>
        <div class="submission-info">
          <span>🕐 ${sub.submittedAt ? formatDate(sub.submittedAt) : '-'}</span>
          ${sub.phone ? `<span>📱 ${sub.phone}</span>` : ''}
        </div>
        ${sub.canCancel ? `
          <div class="submission-actions">
            <button class="btn btn-sm btn-danger-outline cancel-btn" data-id="${sub.id}">
              取消报名
            </button>
          </div>` : ''}
      </div>
    `).join('');

    // Bind cancel buttons
    container.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const subId = btn.dataset.id;
        if (!confirm('确定要取消报名吗？此操作不可撤销。')) return;

        try {
          await cancelSubmission(subId);
          showToast('已取消报名');
          // Remove card from list
          const card = document.getElementById(`sub-${subId}`);
          if (card) card.remove();
          // Check if list is now empty
          if (container.querySelectorAll('.submission-card').length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding-top:60px">
              <div class="empty-icon">📭</div>
              <div class="empty-title">暂无报名记录</div>
            </div>`;
          }
        } catch (err) {
          showToast('取消失败: ' + err.message);
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-text">${escHtml(err.message)}</div></div>`;
  }
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
