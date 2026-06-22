/**
 * 关于页面 — 显示用户角色
 */
import { getLoginUser, logout, isLoggedIn, isAdmin } from '../store.js';
import { navigate } from '../router.js';

export function renderAbout() {
  if (!isLoggedIn()) { navigate('#/login'); return () => {}; }

  const user = getLoginUser();
  const roleLabel = isAdmin() ? '管理员' : '普通用户';
  const roleBadge = isAdmin() ? 'badge-primary' : 'badge-success';
  const app = document.getElementById('app');

  // 根据角色显示不同的底部导航
  const tabbarHTML = isAdmin() ? `
    <div class="tabbar">
      <div class="tabbar-item" data-nav="dashboard"><span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item" data-nav="templates"><span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create"><span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item active" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  ` : `
    <div class="tabbar">
      <div class="tabbar-item" data-nav="registrations"><span class="tab-icon">📋</span><span class="tab-label">我的报名</span></div>
      <div class="tabbar-item active" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `;

  app.innerHTML = `
    <div class="navbar"><span class="navbar-title">关于</span></div>
    <div class="page" style="padding-top:12px">
      <div class="about-section">
        <div class="app-icon">🐻</div>
        <div style="font-size:var(--font-xl);font-weight:700;margin-bottom:4px">小棕熊预约报名</div>
        <div class="text-hint" style="font-size:var(--font-sm)">Version 3.0</div>
      </div>

      <div class="card">
        <div class="card-title mb-12">当前账号</div>
        <div class="flex items-center justify-between">
          <span>📱 ${user?.phone || '-'}</span>
          <span class="badge ${roleBadge}">${roleLabel}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title mb-12">功能说明</div>
        <div class="text-hint" style="font-size:13px;line-height:1.8">
          👤 <b>角色分离</b>：管理员管理活动 / 用户自助报名<br>
          🧩 <b>自定义表单</b>：拖拽式添加多种字段类型<br>
          📋 <b>模板系统</b>：5套预设模板快速开始<br>
          🚀 <b>一键发布</b>：生成链接+二维码分享<br>
          📊 <b>数据管理</b>：实时查看报名数据·导出CSV<br>
          🔒 <b>安全存储</b>：PostgreSQL数据库·JWT认证<br>
          ☕ <b>Java后端</b>：Spring Boot + MyBatis-Plus
        </div>
      </div>

      <button class="btn btn-danger-outline btn-block mt-16" id="logout-btn">退出登录</button>
    </div>

    ${tabbarHTML}
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
    navigate('#/login');
  });

  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const item = e.target.closest('.tabbar-item');
    if (!item) return;
    switch (item.dataset.nav) {
      case 'dashboard': navigate('#/dashboard'); break;
      case 'templates': navigate('#/templates'); break;
      case 'create': navigate('#/create'); break;
      case 'registrations': navigate('#/my-registrations'); break;
      case 'about': break;
    }
  });

  return () => {};
}
