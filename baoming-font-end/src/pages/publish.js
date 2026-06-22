/**
 * 发布页 V3 - 群组模式 + Token 邀请链接
 */
import { showToast } from '../utils.js';
import { getActivity, updateActivity } from '../store.js';
import { navigate, goBack } from '../router.js';

export function renderPublish(params = {}) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">发布活动</span>
    </div>
    <div class="page" style="padding-top:12px">
      <div id="publish-content"><div class="text-center text-hint" style="padding:24px">加载中...</div></div>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', goBack);
  loadActivity();

  async function loadActivity() {
    try {
      const activity = await getActivity(params.id);
      if (!activity) { showToast('活动不存在'); navigate('#/dashboard'); return; }
      renderPublishContent(activity);
    } catch (err) { showToast('加载失败: ' + err.message); }
  }

  function getFormUrl(activity) {
    const baseUrl = window.location.origin + window.location.pathname;
    let formUrl = `${baseUrl}#/form/${activity.id}`;
    if (activity.inviteToken) {
      formUrl += `?token=${activity.inviteToken}`;
    }
    return formUrl;
  }

  function renderPublishContent(activity) {
    const formUrl = getFormUrl(activity);
    const isPublished = activity.status === 'published';
    const groupMode = !!activity.inviteToken;
    const wechatOnly = !!activity.wechatOnly;

    document.getElementById('publish-content').innerHTML = `
      <!-- 状态 -->
      <div class="card" style="text-align:center">
        <div style="font-size:48px;margin-bottom:8px">${isPublished ? '✅' : '📦'}</div>
        <div class="card-title">${isPublished ? '已发布' : '待发布'}</div>
        <div class="text-hint mt-4" style="font-size:13px">
          ${isPublished ? '用户可通过下方链接报名' : '发布后生成报名链接'}
        </div>
        <div class="stats-row mt-12">
          <div class="stat-card-v2"><div class="stat-value">${(activity.fields||[]).length}</div><div class="stat-label">收集字段</div></div>
          <div class="stat-card-v2"><div class="stat-value">${activity.submissionCount||0}</div><div class="stat-label">已报名</div></div>
          <div class="stat-card-v2"><div class="stat-value">${activity.maxParticipants||'∞'}</div><div class="stat-label">人数上限</div></div>
        </div>
      </div>

      <!-- 报名链接 -->
      <div class="card">
        <div class="card-title mb-8">📎 报名链接</div>
        <div style="display:flex;align-items:center;gap:8px;background:var(--bg-page);padding:10px 14px;border-radius:var(--radius-sm)">
          <span style="flex:1;font-size:13px;color:var(--text-secondary);word-break:break-all" id="url-text">${formUrl}</span>
          <button class="btn btn-sm btn-primary" id="copy-btn" style="flex-shrink:0">复制</button>
        </div>
        <div style="display:flex;justify-content:center;margin:16px 0">
          <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(formUrl)}"
               width="160" height="160" alt="二维码" style="border-radius:8px" />
        </div>
        <div class="text-hint text-center" style="font-size:12px">微信扫码即可报名</div>
      </div>

      <!-- 🔑 群组模式设置 -->
      <div class="card" style="border:2px solid ${groupMode ? 'var(--primary)' : 'transparent'}">
        <div class="card-title mb-12">🔐 群组访问控制</div>
        <div class="flex items-center justify-between mb-12">
          <div>
            <span style="font-weight:600">开启群组专属报名</span>
            <div class="text-hint mt-2" style="font-size:11px">仅持有邀请链接的用户可报名</div>
          </div>
          <div class="switch ${groupMode ? 'on' : ''}" id="group-mode-switch"></div>
        </div>
        ${groupMode ? `
          <div style="background:var(--bg-page);padding:12px;border-radius:var(--radius-sm);margin-bottom:12px">
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">🔑 群组邀请 Token</div>
            <div style="display:flex;align-items:center;gap:8px">
              <code style="flex:1;font-size:12px;background:#fff;padding:6px 10px;border-radius:4px;word-break:break-all;border:1px solid #e8e8e8" id="token-text">${activity.inviteToken}</code>
              <button class="btn btn-sm btn-outline" id="copy-token-btn" style="flex-shrink:0">复制</button>
            </div>
            <div class="text-hint mt-8" style="font-size:11px">
              ⚠️ Token 会嵌入报名链接中。重新生成后<strong>旧链接立即失效</strong>，请重新分享。
            </div>
            <button class="btn btn-sm btn-warning-outline mt-8" id="regen-token-btn">🔄 重新生成 Token（旧链接失效）</button>
          </div>
        ` : `
          <div class="text-hint" style="font-size:12px;padding:8px 0">
            开启后生成唯一邀请链接，只有通过该链接进入的用户才能报名。<br>
            适合场景：限定某个微信群内的成员报名，防止链接外泄。
          </div>
        `}

        <!-- 微信专属模式 -->
        <div class="flex items-center justify-between mt-12" style="padding-top:12px;border-top:1px solid var(--border)">
          <div>
            <span style="font-weight:600">仅限微信内打开</span>
            <div class="text-hint mt-2" style="font-size:11px">非微信浏览器无法访问报名页</div>
          </div>
          <div class="switch ${wechatOnly ? 'on' : ''}" id="wechat-only-switch"></div>
        </div>
      </div>

      <!-- 分享渠道 -->
      <div class="card">
        <div class="card-title mb-12">📤 分享到微信群</div>
        <div class="publish-share-row">
          <div class="share-channel" id="share-wechat">
            <div class="ch-icon wechat">💬</div><span class="ch-label">微信好友</span></div>
          <div class="share-channel" id="share-moment">
            <div class="ch-icon moment">🔄</div><span class="ch-label">朋友圈</span></div>
          <div class="share-channel" id="share-link">
            <div class="ch-icon link">🔗</div><span class="ch-label">复制链接</span></div>
          <div class="share-channel" id="share-qr">
            <div class="ch-icon qrcode">📱</div><span class="ch-label">保存二维码</span></div>
        </div>
        ${groupMode ? `
          <div style="background:#fffbe6;padding:10px 14px;border-radius:8px;margin-top:12px;font-size:12px;color:#ad6800">
            💡 <strong>推荐操作：</strong>点击"微信好友"→ 选择目标群 → 粘贴链接发送<br>
            群成员点击链接即可报名，群外人员无法访问。
          </div>
        ` : ''}
      </div>

      <!-- 分享设置 -->
      <div class="card">
        <div class="card-title mb-12">分享设置</div>
        <div class="flex items-center justify-between">
          <span>允许他人分享该报名</span>
          <div class="switch ${activity.allowShare !== false ? 'on' : ''}" id="allow-share-switch"></div>
        </div>
        <div class="text-hint mt-8" style="font-size:12px">
          ${activity.allowShare !== false ? '好友可将报名链接转发到微信群、朋友圈' : '仅管理员可分享，他人无法转发'}
        </div>
      </div>

      <!-- 操作 -->
      <div class="card">
        ${!isPublished ? `
          <button class="btn btn-primary btn-block btn-lg" id="publish-btn">🚀 立即发布</button>
          <div class="text-hint mt-8 text-center" style="font-size:12px">发布后他人可通过链接或扫码报名</div>
        ` : `
          <button class="btn btn-danger-outline btn-block" id="unpublish-btn">⚠️ 取消发布</button>
          <div class="text-hint mt-8 text-center" style="font-size:12px">取消后链接将无法访问，已提交的数据保留</div>
        `}
        <button class="btn btn-outline btn-block mt-12" id="preview-btn">👁 预览报名表单</button>
      </div>
    `;

    bindEvents(activity, formUrl, isPublished, groupMode);
  }

  function bindEvents(activity, formUrl, isPublished, wasGroupMode) {
    // === 群组模式开关 ===
    const groupSwitch = document.getElementById('group-mode-switch');
    if (groupSwitch) {
      groupSwitch.addEventListener('click', async () => {
        const turnOn = !groupSwitch.classList.contains('on');
        try {
          if (turnOn) {
            // 开启群组模式 → 生成 token
            const token = generateLocalToken();
            await updateActivity(activity.id, { inviteToken: token });
            showToast('✅ 群组模式已开启');
            const updated = await getActivity(activity.id);
            renderPublishContent(updated);
          } else {
            // 关闭群组模式
            if (confirm('关闭群组模式后，报名链接将无需 token 即可访问，确定吗？')) {
              await updateActivity(activity.id, { inviteToken: '' });
              showToast('已关闭群组模式');
              const updated = await getActivity(activity.id);
              renderPublishContent(updated);
            }
          }
        } catch (err) { showToast('设置失败: ' + err.message); }
      });
    }

    // === 微信专属开关 ===
    const wechatSwitch = document.getElementById('wechat-only-switch');
    if (wechatSwitch) {
      wechatSwitch.addEventListener('click', async () => {
        const newVal = !wechatSwitch.classList.contains('on');
        try {
          await updateActivity(activity.id, { wechatOnly: newVal });
          wechatSwitch.classList.toggle('on');
          showToast(newVal ? '已开启微信专属模式' : '已关闭微信专属模式');
        } catch (err) { showToast('设置失败: ' + err.message); }
      });
    }

    // === 重新生成 Token ===
    const regenBtn = document.getElementById('regen-token-btn');
    if (regenBtn) {
      regenBtn.addEventListener('click', async () => {
        if (!confirm('重新生成后，旧的报名链接将立即失效，确定吗？')) return;
        try {
          const newToken = generateLocalToken();
          await updateActivity(activity.id, { inviteToken: newToken });
          showToast('✅ Token 已重新生成');
          const updated = await getActivity(activity.id);
          renderPublishContent(updated);
        } catch (err) { showToast('生成失败: ' + err.message); }
      });
    }

    // === 复制 Token ===
    const copyTokenBtn = document.getElementById('copy-token-btn');
    if (copyTokenBtn) {
      copyTokenBtn.addEventListener('click', () => {
        const tokenEl = document.getElementById('token-text');
        if (tokenEl) copyText(tokenEl.textContent);
      });
    }

    // === 分享开关 ===
    const shareSwitch = document.getElementById('allow-share-switch');
    if (shareSwitch) {
      shareSwitch.addEventListener('click', async () => {
        const newVal = !shareSwitch.classList.contains('on');
        try {
          await updateActivity(activity.id, { allowShare: newVal });
          shareSwitch.classList.toggle('on');
          showToast(newVal ? '已开启分享' : '已关闭分享');
          const updated = await getActivity(activity.id);
          renderPublishContent(updated);
        } catch (err) { showToast('设置失败'); }
      });
    }

    document.getElementById('copy-btn').addEventListener('click', () => copyText(formUrl));
    document.getElementById('share-link').addEventListener('click', () => copyText(formUrl));
    document.getElementById('share-qr').addEventListener('click', () => {
      showToast('请长按上方二维码保存');
    });
    document.getElementById('share-wechat').addEventListener('click', () => {
      copyText(formUrl);
      showToast('链接已复制，请打开微信粘贴到目标群');
    });
    document.getElementById('share-moment').addEventListener('click', () => {
      copyText(formUrl);
      showToast('链接已复制，请打开微信朋友圈粘贴');
    });
    document.getElementById('preview-btn').addEventListener('click', () => {
      const previewUrl = `#/form/${activity.id}?preview=1`;
      if (activity.inviteToken) {
        navigate(`${previewUrl}&token=${activity.inviteToken}`);
      } else {
        navigate(previewUrl);
      }
    });

    if (!isPublished) {
      document.getElementById('publish-btn').addEventListener('click', async () => {
        try {
          await updateActivity(activity.id, { status: 'published' });
          showToast('🎉 发布成功！');
          const updated = await getActivity(activity.id);
          renderPublishContent(updated);
        } catch (err) { showToast('发布失败: ' + err.message); }
      });
    } else {
      document.getElementById('unpublish-btn').addEventListener('click', async () => {
        if (!confirm('取消发布后链接将失效，确定吗？')) return;
        try {
          await updateActivity(activity.id, { status: 'draft' });
          showToast('已取消发布');
          const updated = await getActivity(activity.id);
          renderPublishContent(updated);
        } catch (err) { showToast('操作失败: ' + err.message); }
      });
    }
  }

  return () => {};
}

/** 生成一个本地随机 token */
function generateLocalToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  // fallback
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('✅ 已复制'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('✅ 已复制'); } catch { showToast('复制失败'); }
    document.body.removeChild(ta);
  }
}
