/**
 * 公开报名表单页 — API 版本 (V3: Token 群组控制)
 */
import { showToast, formatDate, getHashParam } from '../utils.js';
import { getPublicActivity, addSubmission } from '../store.js';
import { renderFormFields, collectFormData, initImageUploads, initLocationButtons, initOptionStyles } from '../components/form-renderer.js';
import { genId } from '../utils.js';

export function renderRegisterForm(params = {}) {
  const app = document.getElementById('app');

  // 从 hash URL 提取 token 参数（如 #/form/abc?token=xyz）
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
        // 预览模式用管理接口
        const { getActivity } = await import('../store.js');
        activity = await getActivity(params.id);
      } else {
        // 公开接口，传入 token
        activity = await getPublicActivity(params.id, token);
      }

      if (!activity) {
        app.innerHTML = `<div class="register-page"><div class="empty-state" style="padding-top:100px"><div class="empty-icon">🔍</div><div class="empty-text">活动不存在或已下架</div></div></div>`;
        return;
      }

      const fields = activity.fields || [];
      const isEnded = !isPreview && activity.status !== 'published';
      const maxReached = activity.maxParticipants > 0 && activity.submissionCount >= activity.maxParticipants;

      // 检查是否需要 token 但没有提供
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
            <div id="register-form-container">${renderFormFields(fields)}</div>
            ${fields.length > 0 && !isEnded && !maxReached ? `<button class="btn btn-primary btn-block btn-lg mt-16" id="submit-btn">📝 提交报名</button>` : ''}
            ${fields.length === 0 ? `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">暂无需要填写的表单</div></div>` : ''}
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
      // 处理 403 token 错误
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
  const container = document.getElementById('register-form-container');
  const { data, errors } = collectFormData(fields, container);
  const errorCount = Object.keys(errors).length;

  if (errorCount > 0) {
    showToast(`请检查 ${errorCount} 项错误`);
    return;
  }

  if (isPreview) {
    showToast('✅ 预览验证通过！');
    console.log('预览数据:', data);
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';

  try {
    await addSubmission(activity.id, {
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
          <div class="text-hint">感谢您的参与，请留意后续通知</div>
        </div>
      </div>`;
  } catch (err) {
    // 处理 403 token 错误
    if (err.message.includes('token') || err.message.includes('链接') || err.message.includes('微信')) {
      showToast('报名失败: ' + err.message);
      // 延迟刷新以重新验证
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showToast('提交失败: ' + err.message);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = '📝 提交报名';
  }
}

function escHtml(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
