/**
 * 仪表盘 V3 - 仅管理员可访问
 */
import { showToast, formatDate } from '../utils.js';
import { getActivities, deleteActivity, getLoginUser, isAdmin, logout, updateActivity } from '../store.js';
import { navigate } from '../router.js';

let currentTab = 'all';
let searchKeyword = '';

export function renderDashboard() {
  if (!isAdmin()) { navigate('#/login'); return () => {}; }

  const user = getLoginUser();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="dashboard-header">
      <div class="greeting">👋 管理员</div>
      <div class="title-section">
        <div class="main-title">小棕熊预约报名</div>
        <div class="avatar">🐻</div>
      </div>
    </div>

    <div style="background:var(--bg-white);padding:12px 16px">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="搜索活动名称..." />
      </div>
    </div>

    <div class="dashboard-tabs" id="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="all">全部</div>
      <div class="dashboard-tab" data-tab="published">已发布</div>
      <div class="dashboard-tab" data-tab="draft">草稿</div>
      <div class="dashboard-tab" data-tab="ended">已结束</div>
    </div>

    <div class="page" style="padding-top:12px" id="activity-list-container">
      <div class="text-center text-hint" style="padding:24px">加载中...</div>
    </div>

    <button class="fab" id="create-fab">+</button>

    <div class="tabbar">
      <div class="tabbar-item active" data-nav="dashboard"><span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item" data-nav="templates"><span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create"><span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `;

  bindEvents();
  loadActivities();
  return () => {};
}

function bindEvents() {
  document.getElementById('create-fab').addEventListener('click', () => navigate('#/create'));

  document.getElementById('dashboard-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.dashboard-tab');
    if (!tab) return;
    currentTab = tab.dataset.tab;
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadActivities();
  });

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    loadActivities();
  });

  document.getElementById('activity-list-container').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    switch (action) {
      case 'form': navigate(`#/builder/${id}`); break;
      case 'publish': navigate(`#/publish/${id}`); break;
      case 'data': navigate(`#/data/${id}`); break;
      case 'edit': navigate(`#/edit/${id}`); break;
      case 'duplicate': await handleDuplicate(id); break;
      case 'delete': await handleDelete(id); break;
      case 'end': await handleEnd(id); break;
    }
  });

  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const item = e.target.closest('.tabbar-item');
    if (!item) return;
    switch (item.dataset.nav) {
      case 'dashboard': navigate('#/dashboard'); break;
      case 'templates': navigate('#/templates'); break;
      case 'create': navigate('#/create'); break;
      case 'about': navigate('#/about'); break;
    }
  });
}

async function loadActivities() {
  const container = document.getElementById('activity-list-container');
  try {
    const activities = await getActivities();
    const filtered = activities.filter(a => {
      const matchTab = currentTab === 'all' || a.status === currentTab;
      const matchSearch = !searchKeyword || a.name.toLowerCase().includes(searchKeyword);
      return matchTab && matchSearch;
    });

    document.getElementById('stat-total')?.remove();
    const statsHTML = `
      <div class="stats-row" id="stat-total">
        <div class="stat-card-v2"><div class="stat-value">${activities.length}</div><div class="stat-label">全部活动</div></div>
        <div class="stat-card-v2"><div class="stat-value">${activities.filter(a=>a.status==='published').length}</div><div class="stat-label">已发布</div></div>
        <div class="stat-card-v2 accent"><div class="stat-value">${activities.reduce((s,a)=>s+(a.submissionCount||0),0)}</div><div class="stat-label">报名总人数</div></div>
      </div>`;

    if (filtered.length === 0) {
      container.innerHTML = statsHTML + `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">${searchKeyword ? '未找到匹配的活动' : '还没有活动'}</div>
          <div class="empty-text">${searchKeyword ? '换个关键词试试' : '点击右下角 + 号创建第一个活动吧'}</div>
        </div>`;
    } else {
      container.innerHTML = statsHTML + filtered.map(renderActivityCard).join('');
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-text">${err.message}</div></div>`;
  }
}

function renderActivityCard(activity) {
  const fieldsCount = (activity.fields || []).length;
  const subs = activity.submissionCount || 0;
  const max = activity.maxParticipants || 0;
  const progressPct = max > 0 ? Math.round(subs / max * 100) : 0;

  const statusBadge = {
    published: '<span class="badge badge-success">进行中</span>',
    draft: '<span class="badge badge-info">草稿</span>',
    ended: '<span class="badge" style="background:#f5f5f5;color:#999">已截止</span>',
  };

  return `
    <div class="activity-card">
      <div class="card-top">
        <div>
          <div class="activity-name">${escHtml(activity.name)}</div>
          <div style="margin-top:4px;display:flex;align-items:center;gap:8px">
            ${statusBadge[activity.status] || statusBadge.draft}
            ${max > 0 ? `<span class="text-hint" style="font-size:11px">${subs}/${max}人</span>` : `<span class="text-hint" style="font-size:11px">${subs}人报名</span>`}
          </div>
        </div>
        ${activity.status === 'published' ? '<span class="status-dot published"></span>' : ''}
      </div>
      ${max > 0 && subs > 0 ? `
        <div style="height:3px;background:#f0ede9;border-radius:2px;margin:8px 0">
          <div style="height:3px;background:var(--primary);border-radius:2px;width:${Math.min(progressPct, 100)}%;transition:width 0.5s"></div>
        </div>
      ` : ''}
      <div class="info-row">
        <span class="info-item">📅 ${activity.startTime ? formatDate(activity.startTime) : '未设置时间'}</span>
        <span class="info-item">📝 ${fieldsCount}字段</span>
        ${activity.location ? `<span class="info-item">📍 ${escHtml(activity.location.slice(0,10))}</span>` : ''}
      </div>
      <div class="action-bar">
        <button class="btn btn-sm btn-outline" data-action="form" data-id="${activity.id}">✏️ 编辑表单</button>
        <button class="btn btn-sm btn-outline" data-action="publish" data-id="${activity.id}">🚀 发布</button>
        <button class="btn btn-sm btn-outline" data-action="data" data-id="${activity.id}">📊 数据</button>
        <button class="btn btn-sm btn-ghost" data-action="delete" data-id="${activity.id}" style="padding:0 6px;color:var(--text-hint)">🗑</button>
      </div>
    </div>`;
}

async function handleDelete(id) {
  if (!confirm('确定删除这个活动吗？报名数据也会被清除。')) return;
  try { await deleteActivity(id); showToast('已删除'); loadActivities(); }
  catch (err) { showToast('删除失败: ' + err.message); }
}

async function handleDuplicate(id) {
  try {
    const activities = await getActivities();
    const src = activities.find(a => a.id === id);
    if (!src) return;
    const { createActivity } = await import('../store.js');
    const { genId } = await import('../utils.js');
    const newId = genId();
    await createActivity({
      id: newId, name: src.name + ' (副本)', description: src.description,
      location: src.location, startTime: src.startTime, endTime: src.endTime,
      maxParticipants: src.maxParticipants, status: 'draft', fields: src.fields || [],
      createdAt: Date.now(),
    });
    showToast('已复制活动');
    loadActivities();
  } catch (err) { showToast('复制失败: ' + err.message); }
}

async function handleEnd(id) {
  if (!confirm('确定结束这个活动吗？结束后用户将无法报名。')) return;
  try { await updateActivity(id, { status: 'ended' }); showToast('活动已结束'); loadActivities(); }
  catch (err) { showToast('操作失败: ' + err.message); }
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
