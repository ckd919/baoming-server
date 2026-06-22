/**
 * 小棕熊预约报名 H5 - 主入口 V3 (Java 后端 + 角色权限)
 */
import { startRouter, navigate } from './router.js';
import { isLoggedIn, isAdmin, isUser } from './store.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCreateActivity } from './pages/create-activity.js';
import { renderFormBuilder } from './pages/form-builder.js';
import { renderPublish } from './pages/publish.js';
import { renderDataView } from './pages/data-view.js';
import { renderRegisterForm } from './pages/register-form.js';
import { renderTemplates } from './pages/templates.js';
import { renderAbout } from './pages/about.js';
import { renderMyRegistrations } from './pages/my-registrations.js';

/** 需要特定角色才能访问的路由守卫 */
function requireRole(role, renderFn) {
  return (params) => {
    if (!isLoggedIn()) { navigate('#/login'); return () => {}; }
    if (role === 'ADMIN' && !isAdmin()) {
      navigate(isUser() ? '#/my-registrations' : '#/login');
      return () => {};
    }
    if (role === 'USER' && !isUser()) {
      navigate(isAdmin() ? '#/dashboard' : '#/login');
      return () => {};
    }
    return renderFn(params);
  };
}

/** 需要登录即可（不限制角色） */
function requireAuth(renderFn) {
  return (params) => {
    if (!isLoggedIn()) { navigate('#/login'); return () => {}; }
    return renderFn(params);
  };
}

const routes = {
  '/login':              (p) => renderLogin(),
  '/dashboard':          (p) => requireRole('ADMIN', renderDashboard)(p),
  '/templates':          (p) => requireRole('ADMIN', renderTemplates)(p),
  '/about':              (p) => requireAuth(renderAbout)(p),
  '/create':             (p) => requireRole('ADMIN', renderCreateActivity)(p),
  '/edit/:id':           (p) => requireRole('ADMIN', renderCreateActivity)(p),
  '/builder/:id':        (p) => requireRole('ADMIN', renderFormBuilder)(p),
  '/publish/:id':        (p) => requireRole('ADMIN', renderPublish)(p),
  '/data/:id':           (p) => requireRole('ADMIN', renderDataView)(p),
  '/form/:id':           (p) => renderRegisterForm(p),
  '/my-registrations':   (p) => requireRole('USER', renderMyRegistrations)(p),
};

function initApp() {
  console.log('🐻 小棕熊预约报名 V3 启动中...');
  console.log('👤 管理员登录 | 📱 用户手机号登录');
  startRouter(routes);
  const hash = window.location.hash.replace('#', '');
  if (!hash) {
    if (isAdmin()) navigate('#/dashboard');
    else if (isUser()) navigate('#/my-registrations');
    else navigate('#/login');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
