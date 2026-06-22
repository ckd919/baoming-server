/**
 * 创建/编辑活动 — API 版本
 */
import { showToast, genId } from '../utils.js';
import { createActivity, getActivity, updateActivity } from '../store.js';
import { navigate, goBack } from '../router.js';

export function renderCreateActivity(params = {}) {
  const isEdit = !!params.id;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">${isEdit ? '编辑活动' : '创建活动'}</span>
    </div>
    <div class="page">
      <div class="card">
        <div class="form-group">
          <label class="form-label">活动名称 <span class="required">*</span></label>
          <input type="text" class="form-input" id="activity-name" placeholder="例如：2024年度技术分享会" />
        </div>
        <div class="form-group">
          <label class="form-label">活动描述</label>
          <textarea class="form-textarea" id="activity-desc" placeholder="介绍一下活动内容、参与须知等..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">活动地点</label>
          <input type="text" class="form-input" id="activity-location" placeholder="例如：XX市XX路XX号" />
        </div>
      </div>
      <div class="card">
        <div class="card-title mb-12">时间设置</div>
        <div class="form-group">
          <label class="form-label">报名开始时间</label>
          <input type="datetime-local" class="form-input" id="start-time" />
        </div>
        <div class="form-group">
          <label class="form-label">报名截止时间</label>
          <input type="datetime-local" class="form-input" id="end-time" />
        </div>
      </div>
      <div class="card">
        <div class="card-title mb-12">报名限制</div>
        <div class="form-group">
          <label class="form-label">最大报名人数（0表示不限）</label>
          <input type="number" class="form-input" id="max-participants" value="0" min="0" />
        </div>
      </div>
    </div>
    <div class="fixed-bottom">
      <button class="btn btn-primary btn-block btn-lg" id="save-btn">
        ${isEdit ? '保存修改' : '下一步：设置报名表单 →'}
      </button>
    </div>
  `;

  document.getElementById('back-btn').addEventListener('click', goBack);
  document.getElementById('save-btn').addEventListener('click', handleSave);

  // 编辑模式下加载数据
  if (isEdit) {
    loadActivityData(params.id);
  }

  async function loadActivityData(id) {
    try {
      const activity = await getActivity(id);
      if (!activity) { showToast('活动不存在'); navigate('#/dashboard'); return; }
      document.getElementById('activity-name').value = activity.name || '';
      document.getElementById('activity-desc').value = activity.description || '';
      document.getElementById('activity-location').value = activity.location || '';
      if (activity.startTime) document.getElementById('start-time').value = toDatetimeLocal(activity.startTime);
      if (activity.endTime) document.getElementById('end-time').value = toDatetimeLocal(activity.endTime);
      document.getElementById('max-participants').value = activity.maxParticipants || 0;
    } catch (err) {
      showToast('加载活动失败');
    }
  }

  async function handleSave() {
    const name = document.getElementById('activity-name').value.trim();
    if (!name) { showToast('请输入活动名称'); return; }

    const data = {
      name,
      description: document.getElementById('activity-desc').value.trim(),
      location: document.getElementById('activity-location').value.trim(),
      startTime: document.getElementById('start-time').value
        ? new Date(document.getElementById('start-time').value).getTime() : null,
      endTime: document.getElementById('end-time').value
        ? new Date(document.getElementById('end-time').value).getTime() : null,
      maxParticipants: parseInt(document.getElementById('max-participants').value) || 0,
    };

    try {
      if (isEdit) {
        await updateActivity(params.id, data);
        showToast('活动信息已更新');
        goBack();
      } else {
        const activityId = genId();
        const activity = { id: activityId, ...data, fields: [], status: 'draft', createdAt: Date.now() };
        await createActivity(activity);
        showToast('活动创建成功，请设置报名表单');
        setTimeout(() => navigate(`#/builder/${activityId}`), 500);
      }
    } catch (err) {
      showToast('保存失败: ' + err.message);
    }
  }

  return () => {};
}

function toDatetimeLocal(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
