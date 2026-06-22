/**
 * 模板选择页 — 快速创建活动（仅管理员）
 */
import { showToast, genId } from '../utils.js';
import { createActivity, isAdmin } from '../store.js';
import { navigate } from '../router.js';

const TEMPLATES = [
  { id:'training', icon:'📚', name:'培训报名', desc:'课程培训、讲座活动', fields: [
    { id:genId(), type:'name', label:'姓名', placeholder:'请输入中文姓名', required:true, options:[] },
    { id:genId(), type:'phone', label:'手机号码', placeholder:'请输入手机号码', required:true, options:[] },
    { id:genId(), type:'text', label:'单位/公司', placeholder:'请输入单位名称', required:false, options:[] },
    { id:genId(), type:'select', label:'报名场次', options:['上午场 09:00-12:00','下午场 14:00-17:00','全天'], required:true },
  ]},
  { id:'party', icon:'🎉', name:'聚会活动', desc:'同学聚会、团建活动', fields: [
    { id:genId(), type:'name', label:'姓名', placeholder:'请输入中文姓名', required:true, options:[] },
    { id:genId(), type:'phone', label:'手机号码', placeholder:'请输入手机号码', required:true, options:[] },
    { id:genId(), type:'radio', label:'是否携带家属', options:['是','否'], required:true },
    { id:genId(), type:'textarea', label:'特殊需求', placeholder:'饮食禁忌等', required:false, options:[] },
  ]},
  { id:'signup', icon:'📝', name:'通用登记', desc:'信息收集、意向登记', fields: [
    { id:genId(), type:'name', label:'姓名', placeholder:'请输入中文姓名', required:true, options:[] },
    { id:genId(), type:'phone', label:'手机号码', required:true, options:[] },
    { id:genId(), type:'email', label:'电子邮箱', required:false, options:[] },
    { id:genId(), type:'textarea', label:'备注', placeholder:'请输入备注信息', required:false, options:[] },
  ]},
  { id:'competition', icon:'🏆', name:'比赛报名', desc:'赛事、竞赛活动', fields: [
    { id:genId(), type:'name', label:'姓名', placeholder:'请输入中文姓名', required:true, options:[] },
    { id:genId(), type:'phone', label:'手机号码', required:true, options:[] },
    { id:genId(), type:'idcard', label:'身份证号', required:true, options:[] },
    { id:genId(), type:'select', label:'参赛组别', options:['青少年组','成人组','专业组'], required:true },
    { id:genId(), type:'image', label:'作品上传', maxImages:3, required:false, options:[] },
  ]},
  { id:'blank', icon:'📄', name:'空白表单', desc:'从零开始自定义', fields: [] },
];

export function renderTemplates() {
  if (!isAdmin()) { navigate('#/login'); return () => {}; }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">选择模板</span>
    </div>
    <div class="page" style="padding-top:12px">
      <div class="text-hint mb-12" style="font-size:13px">选择一个模板快速开始，后续可以自由修改</div>
      <div class="template-grid" id="template-grid">
        ${TEMPLATES.map(t => `
          <div class="template-card" data-tpl="${t.id}">
            <div class="tpl-icon">${t.icon}</div>
            <div class="tpl-name">${t.name}</div>
            <div class="tpl-desc">${t.desc}</div>
            <div class="tpl-fields">${t.fields.length > 0 ? t.fields.length + '个预设字段' : '自定义添加'}</div>
          </div>
        `).join('')}
      </div>
      <div class="card mt-16" id="quick-create" style="display:none">
        <div class="card-title mb-12">活动名称</div>
        <div class="form-group">
          <input type="text" class="form-input" id="quick-name" placeholder="输入活动名称" />
        </div>
        <button class="btn btn-primary btn-block" id="quick-create-btn">立即创建</button>
      </div>
    </div>
    <div class="tabbar">
      <div class="tabbar-item" data-nav="dashboard"><span class="tab-icon">🏠</span><span class="tab-label">首页</span></div>
      <div class="tabbar-item active" data-nav="templates"><span class="tab-icon">📋</span><span class="tab-label">模板</span></div>
      <div class="tabbar-item" data-nav="create"><span class="tab-icon">➕</span><span class="tab-label">创建</span></div>
      <div class="tabbar-item" data-nav="about"><span class="tab-icon">🐻</span><span class="tab-label">关于</span></div>
    </div>
  `;

  let selectedTpl = null;

  document.getElementById('back-btn').addEventListener('click', () => navigate('#/dashboard'));
  document.getElementById('template-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    selectedTpl = card.dataset.tpl;
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('quick-create').style.display = 'block';
    document.getElementById('quick-name').focus();
  });
  document.getElementById('quick-create-btn').addEventListener('click', async () => {
    if (!selectedTpl) { showToast('请先选择一个模板'); return; }
    const name = document.getElementById('quick-name').value.trim();
    if (!name) { showToast('请输入活动名称'); return; }
    const tpl = TEMPLATES.find(t => t.id === selectedTpl);
    const activityId = genId();
    try {
      await createActivity({
        id: activityId, name,
        description: '', location: '', startTime: null, endTime: null,
        maxParticipants: 0, status: 'draft',
        fields: tpl ? JSON.parse(JSON.stringify(tpl.fields)) : [],
        createdAt: Date.now(),
      });
      showToast('创建成功！');
      setTimeout(() => navigate(`#/builder/${activityId}`), 400);
    } catch (err) { showToast('创建失败: ' + err.message); }
  });
  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const item = e.target.closest('.tabbar-item');
    if (!item) return;
    switch (item.dataset.nav) {
      case 'dashboard': navigate('#/dashboard'); break;
      case 'templates': break;
      case 'create': navigate('#/create'); break;
      case 'about': navigate('#/about'); break;
    }
  });
  return () => {};
}
