/**
 * 登录页 — 双模式：管理员登录 / 用户登录
 */
import { showToast } from '../utils.js';
import { adminLogin, userPhoneLogin, isLoggedIn, isAdmin, isUser } from '../store.js';
import { navigate } from '../router.js';

export function renderLogin() {
  // 自动跳转到对应主页
  if (isLoggedIn()) {
    if (isAdmin()) navigate('#/dashboard');
    else if (isUser()) navigate('#/my-registrations');
    return () => {};
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <div class="login-logo">📋</div>
      <div class="login-title">小棕熊预约报名</div>
      <div class="login-subtitle">活动预约 · 培训报名 · 场馆预约</div>

      <div class="login-tabs">
        <button class="login-tab active" data-mode="admin" id="tab-admin">管理员登录</button>
        <button class="login-tab" data-mode="user" id="tab-user">用户登录</button>
      </div>

      <div class="login-card" id="admin-form">
        <div class="form-group">
          <label class="form-label">手机号码</label>
          <input type="tel" class="form-input" id="admin-phone"
                 placeholder="请输入手机号码" maxlength="11"
                 autocomplete="tel" />
          <div class="form-error" id="admin-phone-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input type="password" class="form-input" id="admin-password"
                 placeholder="请输入密码"
                 autocomplete="current-password" />
          <div class="form-error" id="admin-password-error"></div>
        </div>

        <button class="btn btn-primary btn-block btn-lg" id="admin-login-btn">
          管理员登录
        </button>
        <div class="text-hint text-center mt-8" style="font-size:11px">仅供活动组织者使用</div>
      </div>

      <div class="login-card hidden" id="user-form">
        <div class="form-group">
          <label class="form-label">手机号码</label>
          <input type="tel" class="form-input" id="user-phone"
                 placeholder="请输入手机号码" maxlength="11"
                 autocomplete="tel" />
          <div class="form-error" id="user-phone-error"></div>
        </div>
        <div class="text-hint mt-8" style="font-size:12px;color:#999;line-height:1.6">
          📌 输入手机号即可查看您的所有报名记录<br/>
          📌 首次使用将自动创建账号，无需密码
        </div>

        <button class="btn btn-primary btn-block btn-lg mt-12" id="user-login-btn">
          查看我的报名
        </button>
      </div>
    </div>
  `;

  let currentMode = 'admin';

  // Tab 切换
  document.getElementById('tab-admin').addEventListener('click', () => switchMode('admin'));
  document.getElementById('tab-user').addEventListener('click', () => switchMode('user'));

  function switchMode(mode) {
    currentMode = mode;
    document.getElementById('tab-admin').classList.toggle('active', mode === 'admin');
    document.getElementById('tab-user').classList.toggle('active', mode === 'user');
    document.getElementById('admin-form').classList.toggle('hidden', mode !== 'admin');
    document.getElementById('user-form').classList.toggle('hidden', mode !== 'user');
  }

  // 管理员登录
  const adminPhoneInput = document.getElementById('admin-phone');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminLoginBtn = document.getElementById('admin-login-btn');

  adminPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdminLogin();
  });
  adminLoginBtn.addEventListener('click', handleAdminLogin);

  async function handleAdminLogin() {
    const phoneError = document.getElementById('admin-phone-error');
    const passwordError = document.getElementById('admin-password-error');
    phoneError.textContent = '';
    passwordError.textContent = '';

    const phone = adminPhoneInput.value.trim();
    const password = adminPasswordInput.value;

    if (!phone) { phoneError.textContent = '请输入手机号码'; return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { phoneError.textContent = '手机号码格式不正确'; return; }
    if (!password) { passwordError.textContent = '请输入密码'; return; }

    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = '登录中...';

    try {
      await adminLogin(phone, password);
      showToast('登录成功！');
      setTimeout(() => navigate('#/dashboard'), 500);
    } catch (err) {
      showToast(err.message || '登录失败');
      adminLoginBtn.disabled = false;
      adminLoginBtn.textContent = '管理员登录';
    }
  }

  // 用户登录（仅手机号）
  const userPhoneInput = document.getElementById('user-phone');
  const userLoginBtn = document.getElementById('user-login-btn');

  userPhoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserLogin();
  });
  userLoginBtn.addEventListener('click', handleUserLogin);

  async function handleUserLogin() {
    const phoneError = document.getElementById('user-phone-error');
    phoneError.textContent = '';

    const phone = userPhoneInput.value.trim();

    if (!phone) { phoneError.textContent = '请输入手机号码'; return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { phoneError.textContent = '手机号码格式不正确'; return; }

    userLoginBtn.disabled = true;
    userLoginBtn.textContent = '加载中...';

    try {
      const data = await userPhoneLogin(phone);
      const msg = data.isNew ? '欢迎！账号已自动创建' : '欢迎回来！';
      showToast(msg);
      setTimeout(() => navigate('#/my-registrations'), 500);
    } catch (err) {
      showToast(err.message || '登录失败');
      userLoginBtn.disabled = false;
      userLoginBtn.textContent = '查看我的报名';
    }
  }

  return () => {};
}
