/**
 * 表单构建器 V2 - 分组字段面板、优化编辑体验
 */
import { showToast, showModal, closeModal } from '../utils.js';
import { getActivity, updateActivityFields } from '../store.js';
import { navigate, goBack } from '../router.js';
import {
  FIELD_TYPES, createField,
  renderFieldEditor, collectFieldData,
} from '../components/field-editor.js';

// 字段分组
const FIELD_GROUPS = {
  base: { name: '基础', types: ['name','text','textarea','number'] },
  choice: { name: '选择', types: ['radio','checkbox','select'] },
  datetime: { name: '日期', types: ['date','time'] },
  contact: { name: '联系方式', types: ['phone','email','idcard','location'] },
  media: { name: '附件', types: ['image'] },
  pay: { name: '收款', types: ['fee'] },
};

export function renderFormBuilder(params = {}) {
  const app = document.getElementById('app');
  let activeGroup = 'base';

  app.innerHTML = `
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">自定义收集表单</span>
    </div>

    <div class="page" style="padding-bottom:180px">
      <div class="text-hint mb-8" style="font-size:12px" id="activity-name-label">加载中...</div>

      <!-- 字段分组标签 -->
      <div class="field-category-bar" id="category-bar">
        ${Object.entries(FIELD_GROUPS).map(([key, g]) =>
          `<span class="tag ${key === activeGroup ? 'selected' : ''}" data-group="${key}">${g.name}</span>`
        ).join('')}
      </div>

      <!-- 字段类型面板 -->
      <div class="card" style="padding:12px">
        <div class="field-type-palette" id="type-palette"></div>
      </div>

      <!-- 已添加字段 -->
      <div style="margin-top:12px">
        <div class="flex items-center justify-between mb-8">
          <span style="font-size:var(--font-base);font-weight:600">表单字段</span>
          <span class="text-hint" style="font-size:12px" id="field-count">0个字段</span>
        </div>
        <div id="fields-container">
          <div class="text-center text-hint" style="padding:24px">加载中...</div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="fixed-bottom no-tab" style="display:flex;gap:12px">
      <button class="btn btn-outline flex-1" id="preview-btn">👁 预览</button>
      <button class="btn btn-primary flex-1 btn-lg" id="save-fields-btn">💾 保存并发布</button>
    </div>
  `;

  let activity = null;

  // 渲染字段面板
  function renderPalette() {
    const palette = document.getElementById('type-palette');
    const types = FIELD_GROUPS[activeGroup]?.types || [];
    palette.innerHTML = types.map(type => {
      const def = FIELD_TYPES[type];
      return `<div class="field-type-btn" data-type="${type}">
        <span class="ft-icon">${def.icon}</span><span>${def.name}</span></div>`;
    }).join('');
  }
  renderPalette();

  // 事件绑定
  document.getElementById('back-btn').addEventListener('click', goBack);

  document.getElementById('category-bar').addEventListener('click', (e) => {
    const tag = e.target.closest('.tag');
    if (!tag) return;
    activeGroup = tag.dataset.group;
    document.querySelectorAll('#category-bar .tag').forEach(t => t.classList.remove('selected'));
    tag.classList.add('selected');
    renderPalette();
  });

  document.getElementById('type-palette').addEventListener('click', (e) => {
    const btn = e.target.closest('.field-type-btn');
    if (!btn || !activity) return;
    addField(btn.dataset.type);
  });

  document.getElementById('fields-container').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, fieldId } = btn.dataset;
    if (action === 'edit') openFieldEditor(fieldId);
    else if (action === 'delete') deleteField(fieldId);
    else if (action === 'moveUp') moveField(fieldId, -1);
    else if (action === 'moveDown') moveField(fieldId, 1);
  });

  document.getElementById('save-fields-btn').addEventListener('click', async () => {
    if (!activity) return;
    try {
      await updateActivityFields(params.id, activity.fields);
      showToast('保存成功！');
      setTimeout(() => navigate(`#/publish/${params.id}`), 400);
    } catch (err) { showToast('保存失败: ' + err.message); }
  });

  document.getElementById('preview-btn').addEventListener('click', () => {
    if (!activity) return;
    navigate(`#/form/${params.id}?preview=1`);
  });

  // 加载
  loadActivity();

  async function loadActivity() {
    try {
      activity = await getActivity(params.id);
      if (!activity) { showToast('活动不存在'); navigate('#/dashboard'); return; }
      document.getElementById('activity-name-label').textContent = '📋 ' + activity.name;
      refreshFields();
    } catch (err) { showToast('加载失败: ' + err.message); }
  }

  function refreshFields() {
    const fields = activity?.fields || [];
    document.getElementById('field-count').textContent = fields.length + '个字段';
    const container = document.getElementById('fields-container');
    container.innerHTML = fields.length === 0
      ? `<div class="empty-state"><div class="empty-icon">🧩</div>
         <div class="empty-title">还没有添加字段</div>
         <div class="empty-text">点击上方字段类型开始构建表单</div></div>`
      : fields.map((f, i) => renderFieldCard(f, i, fields.length)).join('');
  }

  function addField(type) {
    const field = createField(type);
    if (!field) return;
    activity.fields = [...(activity.fields || []), field];
    refreshFields();
    showToast(`已添加「${field.label}」`);
  }

  function deleteField(fieldId) {
    const field = activity.fields?.find(f => f.id === fieldId);
    if (!confirm(`确定删除「${field?.label || ''}」吗？`)) return;
    activity.fields = activity.fields.filter(f => f.id !== fieldId);
    refreshFields();
    showToast('已删除');
  }

  function moveField(fieldId, offset) {
    const fields = [...activity.fields];
    const idx = fields.findIndex(f => f.id === fieldId);
    if (idx === -1) return;
    const newIdx = idx + offset;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    activity.fields = fields;
    refreshFields();
  }

  function openFieldEditor(fieldId) {
    const field = activity.fields.find(f => f.id === fieldId);
    if (!field) return;
    const modal = showModal({
      title: '编辑字段',
      content: renderFieldEditor(field),
      footer: `<button class="btn btn-primary btn-block" id="save-field-edit-btn">确认修改</button>`,
    });
    if (!modal) return;

    modal.querySelector('#field-required')?.addEventListener('click', function () {
      this.classList.toggle('on');
    });
    modal.querySelector('#add-option-btn')?.addEventListener('click', () => {
      const list = modal.querySelector('#option-list');
      if (!list) return;
      const li = document.createElement('li');
      li.className = 'option-item';
      li.innerHTML = `<span style="color:var(--text-hint);font-size:12px">${list.children.length + 1}.</span>
        <input type="text" class="form-input option-input" value="" />
        <button class="btn-icon option-delete" title="删除">✕</button>`;
      li.querySelector('.option-delete').addEventListener('click', () => li.remove());
      list.appendChild(li);
    });
    modal.querySelectorAll('.option-delete').forEach(b =>
      b.addEventListener('click', () => b.closest('.option-item').remove())
    );
    modal.querySelector('#save-field-edit-btn').addEventListener('click', () => {
      const updated = collectFieldData(modal, field);
      activity.fields = activity.fields.map(f => f.id === fieldId ? updated : f);
      closeModal();
      refreshFields();
      showToast('字段已更新');
    });
  }

  return () => {};
}

// ===== 卡片渲染 =====
function renderFieldCard(field, idx, total) {
  const typeDef = FIELD_TYPES[field.type];
  let preview = '';
  switch (field.type) {
    case 'name': preview = `<input class="form-input" placeholder="中文姓名" disabled />`; break;
    case 'text': preview = `<input class="form-input" placeholder="单行文本" disabled />`; break;
    case 'textarea': preview = `<textarea class="form-textarea" rows="2" placeholder="多行文本" disabled></textarea>`; break;
    case 'number': preview = `<input type="number" class="form-input" placeholder="数字" disabled />`; break;
    case 'date': preview = `<input type="date" class="form-input" disabled />`; break;
    case 'time': preview = `<input type="time" class="form-input" disabled />`; break;
    case 'phone': preview = `<input type="tel" class="form-input" placeholder="手机号码" disabled />`; break;
    case 'email': preview = `<input type="email" class="form-input" placeholder="邮箱" disabled />`; break;
    case 'idcard': preview = `<input type="text" class="form-input" placeholder="身份证号" disabled />`; break;
    case 'radio': preview = (field.options||[]).map(o=>`◉ ${o}`).join(' | '); break;
    case 'checkbox': preview = (field.options||[]).map(o=>`☐ ${o}`).join(' | '); break;
    case 'select': preview = `<select class="form-select" disabled><option>${(field.options||[])[0]||'选项'}</option></select>`; break;
    case 'image': preview = `<div class="image-upload-item">+</div>`; break;
    case 'location': preview = `<input class="form-input" placeholder="点击获取位置" disabled />`; break;
    case 'fee': preview = `<input class="form-input" value="¥ 0.00" style="font-weight:600;color:var(--primary)" disabled />`; break;
    default: preview = `<input class="form-input" disabled />`;
  }

  return `
    <div class="field-card-v2">
      <div class="fc-header">
        <span class="fc-drag">⠿</span>
        <div class="fc-info">
          <div class="fc-label">${escHtml(field.label)} ${field.required?'<span style="color:var(--danger)">*</span>':''}</div>
          <div class="fc-meta">${typeDef?.icon||''} ${typeDef?.name||field.type} · 第${idx+1}项</div>
        </div>
        <div class="fc-actions">
          ${idx > 0 ? `<button data-action="moveUp" data-field-id="${field.id}">⬆</button>` : ''}
          ${idx < total-1 ? `<button data-action="moveDown" data-field-id="${field.id}">⬇</button>` : ''}
          <button data-action="edit" data-field-id="${field.id}">✏</button>
          <button data-action="delete" data-field-id="${field.id}">🗑</button>
        </div>
      </div>
      <div class="fc-preview">${preview}</div>
    </div>`;
}

function escHtml(str) { const d=document.createElement('div'); d.textContent=str||''; return d.innerHTML; }
