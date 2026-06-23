/**
 * 字段编辑器组件
 * 用于弹窗中编辑单个表单字段的属性（标题、必填、选项等）
 */
import { genId } from '../utils.js';

/**
 * 字段类型定义
 * 每个类型包含：图标、名称、默认配置
 */
export const FIELD_TYPES = {
  name:       { icon: '👤', name: '姓名', defaultLabel: '姓名' },
  text:       { icon: '📝', name: '单行文本', defaultLabel: '单行文本' },
  textarea:   { icon: '📄', name: '多行文本', defaultLabel: '多行文本' },
  number:     { icon: '🔢', name: '数字', defaultLabel: '数字' },
  date:       { icon: '📅', name: '日期', defaultLabel: '日期' },
  time:       { icon: '⏰', name: '时间', defaultLabel: '时间' },
  radio:      { icon: '🔘', name: '单选', defaultLabel: '单选', options: ['选项一', '选项二'] },
  checkbox:   { icon: '☑️', name: '多选', defaultLabel: '多选', options: ['选项一', '选项二', '选项三'] },
  select:     { icon: '📋', name: '下拉选择', defaultLabel: '下拉选择', options: ['选项一', '选项二'] },
  phone:      { icon: '📱', name: '手机号', defaultLabel: '手机号码' },
  email:      { icon: '📧', name: '邮箱', defaultLabel: '电子邮箱' },
  idcard:     { icon: '🪪', name: '身份证', defaultLabel: '身份证号' },
  location:   { icon: '📍', name: '地理位置', defaultLabel: '地理位置' },
  image:      { icon: '🖼️', name: '图片上传', defaultLabel: '图片上传' },
  fee:        { icon: '💰', name: '报名费用', defaultLabel: '报名费用' },
};

/**
 * 创建一个新字段（使用默认配置）
 * @param {string} type - 字段类型键名
 * @returns {Object} 字段配置对象
 */
export function createField(type) {
  const def = FIELD_TYPES[type];
  if (!def) return null;

  return {
    id: genId(),
    type,
    label: def.defaultLabel || '未命名字段',
    placeholder: '',
    required: false,
    options: def.options ? [...def.options] : [],
    // 图片上传相关
    maxImages: 9,
  };
}

/**
 * 渲染字段编辑表单 (在 Modal 中使用)
 * @param {Object} field - 当前字段配置
 * @returns {string} HTML
 */
export function renderFieldEditor(field) {
  const typeDef = FIELD_TYPES[field.type];
  const needsOptions = ['radio', 'checkbox', 'select'].includes(field.type);

  return `
    <div class="form-group">
      <label class="form-label">字段类型</label>
      <div class="tag">${typeDef?.icon || ''} ${typeDef?.name || field.type}</div>
    </div>

    <div class="form-group">
      <label class="form-label">字段标题 <span class="required">*</span></label>
      <input type="text" class="form-input" id="field-label"
             value="${escAttr(field.label)}" placeholder="例如：姓名" />
    </div>

    <div class="form-group">
      <label class="form-label">占位提示文字</label>
      <input type="text" class="form-input" id="field-placeholder"
             value="${escAttr(field.placeholder)}" placeholder="输入提示..." />
    </div>

    <div class="form-group flex items-center justify-between">
      <label class="form-label" style="margin-bottom:0">是否必填</label>
      <div class="switch ${field.required ? 'on' : ''}" id="field-required"></div>
    </div>

    ${field.type === 'image' ? `
    <div class="form-group">
      <label class="form-label">最大上传张数</label>
      <input type="number" class="form-input" id="field-max-images"
             value="${field.maxImages || 9}" min="1" max="9" />
    </div>
    ` : ''}

    ${needsOptions ? `
    <div class="form-group">
      <label class="form-label">选项列表</label>
      <ul class="option-list" id="option-list">
        ${(field.options || []).map((opt, idx) => `
          <li class="option-item" data-index="${idx}">
            <span style="color:var(--text-hint);font-size:12px">${idx + 1}.</span>
            <input type="text" class="form-input option-input" value="${escAttr(opt)}" />
            <button class="btn-icon option-delete" title="删除">✕</button>
          </li>
        `).join('')}
      </ul>
      <button class="btn btn-sm btn-outline mt-8" id="add-option-btn">+ 添加选项</button>
    </div>
    ` : ''}
  `;
}

/**
 * 从编辑器 DOM 中收集字段数据
 * @param {HTMLElement} container - 编辑器容器
 * @param {Object} originalField - 原始字段对象
 * @returns {Object} 更新后的字段对象
 */
export function collectFieldData(container, originalField) {
  const label = container.querySelector('#field-label')?.value?.trim() || '未命名字段';
  const placeholder = container.querySelector('#field-placeholder')?.value?.trim() || '';
  const required = container.querySelector('#field-required')?.classList.contains('on') || false;

  const updated = {
    ...originalField,
    label,
    placeholder,
    required,
  };

  // 收集选项
  if (['radio', 'checkbox', 'select'].includes(originalField.type)) {
    const optionInputs = container.querySelectorAll('.option-input');
    updated.options = Array.from(optionInputs)
      .map(inp => inp.value.trim())
      .filter(v => v);
  }

  // 图片上传最大数量
  if (originalField.type === 'image') {
    const maxInput = container.querySelector('#field-max-images');
    updated.maxImages = parseInt(maxInput?.value) || 9;
  }

  return updated;
}

// ========== 辅助 ==========

function escAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
