/**
 * 小棕熊预约报名 H5 - 主入口 V2
 */
import { startRouter, navigate } from './router.js';
import { isLoggedIn } from './store.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCreateActivity } from './pages/create-activity.js';
import { renderFormBuilder } from './pages/form-builder.js';
import { renderPublish } from './pages/publish.js';
import { renderDataView } from './pages/data-view.js';
import { renderRegisterForm } from './pages/register-form.js';
import { renderTemplates } from './pages/templates.js';
import { renderAbout } from './pages/about.js';

function requireAuth(renderFn) {
  return (params) => {
    if (!isLoggedIn()) { navigate('#/login'); return () => {}; }
    return renderFn(params);
  };
}

const routes = {
  '/login':          (p) => renderLogin(),
  '/dashboard':      (p) => requireAuth(renderDashboard)(p),
  '/templates':      (p) => requireAuth(renderTemplates)(p),
  '/about':          (p) => requireAuth(renderAbout)(p),
  '/create':         (p) => requireAuth(renderCreateActivity)(p),
  '/edit/:id':       (p) => requireAuth(renderCreateActivity)(p),
  '/builder/:id':    (p) => requireAuth(renderFormBuilder)(p),
  '/publish/:id':    (p) => requireAuth(renderPublish)(p),
  '/data/:id':       (p) => requireAuth(renderDataView)(p),
  '/form/:id':       (p) => renderRegisterForm(p),
};

function initApp() {
  console.log('🐻 小棕熊预约报名 V2 启动中...');
  console.log('📋 预设账号: 13310843925 / Aled2239');
  startRouter(routes);
  const hash = window.location.hash.replace('#', '');
  if (!hash) {
    navigate(isLoggedIn() ? '#/dashboard' : '#/login');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
