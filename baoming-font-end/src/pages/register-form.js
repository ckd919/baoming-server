/**
 * 公开报名表单页 — 手机号优先流程 (Java 后端)
 * 用户填写手机号后自动登录，报名成功后返回 JWT token
 */
import { showToast, formatDate, getHashParam } from '../utils.js';
import { getPublicActivity, addSubmission } from '../store.js';
import { renderFormFields, collectFormData, initImageUploads, initLocationButtons, initOptionStyles } from '../components/form-renderer.js';
import { genId } from '../utils.js';
import { navigate } from '../router.js';

export function renderRegisterForm(params = {}) {
  const app = document.getElementById('app');

  const token = getHashParam('token') || '';
  const isPreview = getHashParam('preview') === '1';

  app.innerHTML = `
    <div class="register-page">
      <div class="register-cover"><div class="cover-text">
        <div class="cover-title">加载中...</div>
      </div></div>
      <div class="register-body"><div id="register-form-container"><div class="text-center text-hint" style="padding:24px">加载中...</div></div></div>
    </div>
  `;

  loadActivity();

  async function loadActivity() {
    try {
      let activity;
      if (isPreview) {
        const { getActivity } = await import('../store.js');
        activity = await getActivity(params.id);
      } else {
        activity = await getPublicActivity(params.id, token);
      }

      if (!activity) {
        app.innerHTML = `<div class="register-page"><div class="empty-state" style="padding-top:100px"><div class="empty-icon">🔍</div><div class="empty-text">活动不存在或已下架</div></div></div>`;
        return;
      }

      const fields = activity.fields || [];
      const isEnded = !isPreview && activity.status !== 'published';
      const maxReached = activity.maxParticipants > 0 && activity.submissionCount >= activity.maxParticipants;

      if (!isPreview && activity.requireToken && !token) {
        app.innerHTML = `
          <div class="register-page">
            <div class="empty-state" style="padding-top:100px">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">此活动仅限指定群成员报名</div>
              <div class="text-hint mt-8" style="font-size:13px;max-width:280px;margin:0 auto">请联系群管理员获取正确的报名链接</div>
            </div>
          </div>`;
        return;
      }

      app.innerHTML = `
        <div class="register-page">
          <div class="register-cover">
            <div class="cover-text">
              <div class="cover-title">${escHtml(activity.name)}</div>
              ${activity.description ? `<div class="cover-subtitle">${escHtml(activity.description)}</div>` : ''}
              ${activity.startTime ? `<div class="cover-time">📅 ${formatDate(activity.startTime)}</div>` : ''}
              ${activity.location ? `<div class="cover-time">📍 ${escHtml(activity.location)}</div>` : ''}
              ${activity.requireToken ? `<div style="margin-top:8px;font-size:11px;background:rgba(255,255,255,0.2);display:inline-block;padding:2px 10px;border-radius:10px">🔐 群内报名</div>` : ''}
            </div>
          </div>
          ${isPreview ? `<div style="background:#fffbe6;padding:8px 16px;text-align:center;font-size:12px;color:#d48806">⚠️ 预览模式 - 提交不会保存</div>` : ''}
          ${isEnded ? `<div style="background:#fff2f0;padding:8px 16px;text-align:center;font-size:14px;color:#ff4d4f">🚫 活动暂未开放报名</div>` : ''}
          ${maxReached ? `<div style="background:#fff2f0;padding:8px 16px;text-align:center;font-size:14px;color:#ff4d4f">🚫 报名人数已达上限</div>` : ''}
          <div class="register-body">
            <div id="register-form-container">
              <!-- 手机号字段（必填，用于自动登录） -->
              <div class="register-field">
                <div class="field-title">📱 手机号码 <span style="color:#ff4d4f">*</span></div>
                <div style="font-size:11px;color:#999;margin-bottom:4px">用于查看和管理您的报名记录</div>
                <input type="tel" class="form-input" id="auto-phone"
                       placeholder="请输入您的手机号码" maxlength="11"
                       autocomplete="tel" />
                <div class="form-error" id="auto-phone-error"></div>
              </div>
              ${renderFormFields(fields)}
            </div>
            ${fields.length > 0 && !isEnded && !maxReached ? `<button class="btn btn-primary btn-block btn-lg mt-16" id="submit-btn">📝 提交报名</button>` : ''}
            ${fields.length === 0 && !isEnded && !maxReached ? `<button class="btn btn-primary btn-block btn-lg mt-16" id="submit-btn">📝 提交报名</button>` : ''}
          </div>
        </div>`;

      initImageUploads(document.getElementById('register-form-container'));
      initLocationButtons(document.getElementById('register-form-container'));
      initOptionStyles(document.getElementById('register-form-container'));

      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => handleSubmit(activity, fields, isPreview, token));
      }
    } catch (err) {
      if (err.message.includes('token') || err.message.includes('链接') || err.message.includes('微信')) {
        app.innerHTML = `
          <div class="register-page">
            <div class="empty-state" style="padding-top:100px">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">${escHtml(err.message)}</div>
              <div class="text-hint mt-8" style="font-size:13px;max-width:280px;margin:0 auto">请联系群管理员获取正确的报名链接</div>
            </div>
          </div>`;
      } else {
        app.innerHTML = `<div class="register-page"><div class="empty-state" style="padding-top:100px"><div class="empty-text">加载失败: ${err.message}</div></div></div>`;
      }
    }
  }

  return () => {};
}

async function handleSubmit(activity, fields, isPreview, token) {
  // 获取并验证手机号
  const phoneInput = document.getElementById('auto-phone');
  const phone = phoneInput ? phoneInput.value.trim() : '';

  if (!phone) {
    showToast('请输入手机号码');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showToast('手机号码格式不正确');
    return;
  }

  // 收集表单字段数据
  const container = document.getElementById('register-form-container');
  const { data, errors } = collectFormData(fields, container);
  const errorCount = Object.keys(errors).length;

  if (errorCount > 0) {
    showToast(`请检查 ${errorCount} 项错误`);
    return;
  }

  if (isPreview) {
    showToast('✅ 预览验证通过！');
    console.log('预览数据:', { phone, ...data });
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';

  try {
    const result = await addSubmission(activity.id, phone, {
      id: genId(),
      data,
      submittedAt: Date.now(),
    }, token);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="register-page">
        <div class="register-cover"><div class="cover-text"><div class="cover-title">${escHtml(activity.name)}</div></div></div>
        <div class="register-success">
          <div class="success-icon">✅</div>
          <div class="success-text">报名成功！</div>
          <div class="text-hint">手机号 ${phone} 已自动登录</div>
          <button class="btn btn-primary btn-block mt-16" id="view-my-registrations-btn">
            📋 查看我的报名记录
          </button>
          <div class="text-hint mt-8" style="font-size:12px">下次可使用手机号直接查看所有报名</div>
        </div>
      </div>`;

    document.getElementById('view-my-registrations-btn').addEventListener('click', () => {
      navigate('#/my-registrations');
    });
  } catch (err) {
    if (err.message.includes('token') || err.message.includes('链接') || err.message.includes('微信')) {
      showToast('报名失败: ' + err.message);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showToast('提交失败: ' + err.message);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = '📝 提交报名';
  }
}

function escHtml(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
