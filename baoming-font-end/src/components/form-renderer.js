/**
 * 表单渲染器
 * 根据字段配置，渲染出可填写的报名表单，并处理校验和提交
 */
import { isValidPhone, isValidEmail, isValidIdCard, isValidChineseName } from '../utils.js';

/**
 * 渲染报名表单 HTML
 * @param {Array} fields - 字段配置数组
 * @param {Object} values - 已填写的值（编辑回填用）
 * @returns {string} HTML
 */
export function renderFormFields(fields, values = {}) {
  if (!fields || fields.length === 0) {
    return `<div class="empty-state">
      <div class="empty-icon">📝</div>
      <div class="empty-text">暂无需要填写的字段</div>
    </div>`;
  }

  return fields.map((field, index) => {
    const val = values[field.id] ?? '';
    const requiredMark = field.required ? '<span class="required-mark">*</span>' : '';

    let inputHTML = '';
    switch (field.type) {
      case 'name':
        inputHTML = `<input type="text" class="form-input" data-field-id="${field.id}"
                       placeholder="${escAttr(field.placeholder || '请输入中文姓名')}"
                       value="${escAttr(val)}" maxlength="20" />`;
        break;

      case 'text':
        inputHTML = `<input type="text" class="form-input" data-field-id="${field.id}"
                       placeholder="${escAttr(field.placeholder || '请输入')}"
                       value="${escAttr(val)}" />`;
        break;

      case 'textarea':
        inputHTML = `<textarea class="form-textarea" data-field-id="${field.id}"
                        placeholder="${escAttr(field.placeholder || '请输入')}"
                        rows="3">${escHtml(val)}</textarea>`;
        break;

      case 'number':
        inputHTML = `<input type="number" class="form-input" data-field-id="${field.id}"
                       placeholder="${escAttr(field.placeholder || '请输入数字')}"
                       value="${escAttr(val)}" />`;
        break;

      case 'date':
        inputHTML = `<input type="date" class="form-input" data-field-id="${field.id}"
                       value="${escAttr(val)}" />`;
        break;

      case 'time':
        inputHTML = `<input type="time" class="form-input" data-field-id="${field.id}"
                       value="${escAttr(val)}" />`;
        break;

      case 'phone':
        inputHTML = `<input type="tel" class="form-input" data-field-id="${field.id}"
                       placeholder="请输入手机号码" maxlength="11"
                       value="${escAttr(val)}" />`;
        break;

      case 'email':
        inputHTML = `<input type="email" class="form-input" data-field-id="${field.id}"
                       placeholder="请输入邮箱地址"
                       value="${escAttr(val)}" />`;
        break;

      case 'idcard':
        inputHTML = `<input type="text" class="form-input" data-field-id="${field.id}"
                       placeholder="请输入18位身份证号码" maxlength="18"
                       value="${escAttr(val)}" />`;
        break;

      case 'radio':
        inputHTML = `<div class="radio-group" data-field-id="${field.id}">
          ${(field.options || []).map((opt, oi) => `
            <label class="radio-item ${val === opt ? 'selected' : ''}">
              <input type="radio" name="radio-${field.id}" value="${escAttr(opt)}"
                     ${val === opt ? 'checked' : ''} />
              <span>${escHtml(opt)}</span>
            </label>
          `).join('')}
        </div>`;
        break;

      case 'checkbox':
        const checkedVals = Array.isArray(val) ? val : (val ? val.split(',') : []);
        inputHTML = `<div class="checkbox-group" data-field-id="${field.id}">
          ${(field.options || []).map((opt, oi) => `
            <label class="checkbox-item ${checkedVals.includes(opt) ? 'selected' : ''}">
              <input type="checkbox" name="cb-${field.id}" value="${escAttr(opt)}"
                     ${checkedVals.includes(opt) ? 'checked' : ''} />
              <span>${escHtml(opt)}</span>
            </label>
          `).join('')}
        </div>`;
        break;

      case 'select':
        inputHTML = `<select class="form-select" data-field-id="${field.id}">
          <option value="">请选择</option>
          ${(field.options || []).map(opt => `
            <option value="${escAttr(opt)}" ${val === opt ? 'selected' : ''}>${escHtml(opt)}</option>
          `).join('')}
        </select>`;
        break;

      case 'image':
        inputHTML = `
          <div class="image-upload" data-field-id="${field.id}" data-max="${field.maxImages || 9}">
            <div class="image-upload-item" id="img-add-${field.id}" title="点击上传图片">
              <span>+</span>
            </div>
          </div>
          <input type="file" accept="image/*" style="display:none"
                 id="img-input-${field.id}" ${(field.maxImages || 9) > 1 ? 'multiple' : ''} />
          <div class="form-hint">最多上传 ${field.maxImages || 9} 张图片</div>
        `;
        break;

      case 'location':
        inputHTML = `<div style="display:flex;gap:8px">
          <input type="text" class="form-input" data-field-id="${field.id}"
                 placeholder="${escAttr(field.placeholder || '点击获取位置或手动输入地址')}"
                 value="${escAttr(val)}" style="flex:1" />
          <button type="button" class="btn btn-sm btn-outline get-location-btn"
                  data-field-id="${field.id}" style="flex-shrink:0">📍 定位</button>
        </div>`;
        break;

      case 'fee':
        inputHTML = `<div style="position:relative">
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:600;color:var(--primary);z-index:1">¥</span>
          <input type="number" class="form-input" data-field-id="${field.id}"
                 placeholder="0.00" value="${escAttr(val)}"
                 style="padding-left:32px;font-weight:600;font-size:18px" min="0" step="0.01" readonly />
          <div class="form-hint">报名费用由用户确认后支付</div>
        </div>`;
        break;

      default:
        inputHTML = `<input type="text" class="form-input" data-field-id="${field.id}"
                       placeholder="${escAttr(field.placeholder || '请输入')}"
                       value="${escAttr(val)}" />`;
    }

    return `
      <div class="register-field" data-field-type="${field.type}">
        <div class="field-title">${requiredMark} ${escHtml(field.label)}</div>
        ${inputHTML}
        <div class="form-error" id="error-${field.id}"></div>
      </div>
    `;
  }).join('');
}

/**
 * 收集表单数据
 * @param {Array} fields - 字段配置
 * @param {HTMLElement} container - 表单容器
 * @returns {{ data: Object, errors: Object }} 数据和错误信息
 */
export function collectFormData(fields, container) {
  const data = {};
  const errors = {};

  for (const field of fields) {
    let value = '';
    const errorEl = container.querySelector(`#error-${field.id}`);

    switch (field.type) {
      case 'name':
      case 'text':
      case 'textarea':
      case 'number':
      case 'date':
      case 'time':
      case 'phone':
      case 'email':
      case 'idcard':
      case 'location':
      case 'fee':
      case 'select': {
        const el = container.querySelector(`[data-field-id="${field.id}"]`);
        value = el ? el.value.trim() : '';
        break;
      }
      case 'radio': {
        const checked = container.querySelector(`input[name="radio-${field.id}"]:checked`);
        value = checked ? checked.value : '';
        break;
      }
      case 'checkbox': {
        const checked = container.querySelectorAll(`input[name="cb-${field.id}"]:checked`);
        value = Array.from(checked).map(cb => cb.value);
        break;
      }
      case 'image': {
        // 图片以 base64 存在 img 标签中
        const imgContainer = container.querySelector(`.image-upload[data-field-id="${field.id}"]`);
        if (imgContainer) {
          const imgs = imgContainer.querySelectorAll('img');
          value = Array.from(imgs).map(img => img.src);
        }
        break;
      }
    }

    data[field.id] = value;

    // 必填校验
    if (field.required) {
      const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
      if (isEmpty) {
        errors[field.id] = `请${field.type === 'image' ? '上传' : '填写'}${field.label}`;
        if (errorEl) errorEl.textContent = errors[field.id];
      } else if (errorEl) {
        errorEl.textContent = '';
      }
    }

    // 格式校验
    if (value && !errors[field.id]) {
      if (field.type === 'name' && !isValidChineseName(value)) {
        errors[field.id] = '请输入正确的中文姓名（2-20个汉字）';
        if (errorEl) errorEl.textContent = errors[field.id];
      }
      if (field.type === 'phone' && !isValidPhone(value)) {
        errors[field.id] = '手机号码格式不正确';
        if (errorEl) errorEl.textContent = errors[field.id];
      }
      if (field.type === 'email' && !isValidEmail(value)) {
        errors[field.id] = '邮箱格式不正确';
        if (errorEl) errorEl.textContent = errors[field.id];
      }
      if (field.type === 'idcard' && !isValidIdCard(value)) {
        errors[field.id] = '身份证号码格式不正确';
        if (errorEl) errorEl.textContent = errors[field.id];
      }
    }
  }

  return { data, errors };
}

/**
 * 初始化图片上传功能
 * @param {HTMLElement} container - 表单容器
 */
export function initImageUploads(container) {
  const uploadAreas = container.querySelectorAll('.image-upload');
  uploadAreas.forEach(area => {
    const fieldId = area.dataset.fieldId;
    const max = parseInt(area.dataset.max) || 9;
    const fileInput = container.querySelector(`#img-input-${fieldId}`);
    const addBtn = container.querySelector(`#img-add-${fieldId}`);

    if (!fileInput || !addBtn) return;

    // 点击 + 号
    addBtn.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', () => {
      const currentCount = area.querySelectorAll('img').length;
      const remaining = max - currentCount;
      if (remaining <= 0) return;

      const files = Array.from(fileInput.files).slice(0, remaining);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement('div');
          item.className = 'image-upload-item';
          item.innerHTML = `
            <img src="${e.target.result}" alt="uploaded" />
            <button class="remove-img">✕</button>
          `;
          item.querySelector('.remove-img').addEventListener('click', (ev) => {
            ev.stopPropagation();
            item.remove();
            // 如果没有图片了，显示 + 号
            if (area.querySelectorAll('img').length === 0) {
              addBtn.style.display = '';
            }
          });
          area.insertBefore(item, addBtn);
          // 超过限制隐藏 +
          if (area.querySelectorAll('img').length >= max) {
            addBtn.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = '';
    });
  });
}

/**
 * 初始化地理位置按钮
 */
export function initLocationButtons(container) {
  container.querySelectorAll('.get-location-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fieldId = btn.dataset.fieldId;
      const input = container.querySelector(`input[data-field-id="${fieldId}"]`);
      if (!input) return;
      if (navigator.geolocation) {
        btn.textContent = '获取中...';
        btn.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            input.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
            btn.textContent = '定位';
            btn.disabled = false;
          },
          () => {
            input.placeholder = '无法获取位置，请手动输入';
            btn.textContent = '定位';
            btn.disabled = false;
          },
          { timeout: 10000 }
        );
      }
    });
  });
}

/**
 * 绑定单选/多选的交互样式
 */
export function initOptionStyles(container) {
  // 单选
  container.querySelectorAll('.radio-item input').forEach(radio => {
    radio.addEventListener('change', function () {
      const group = this.closest('.radio-group');
      group.querySelectorAll('.radio-item').forEach(item => item.classList.remove('selected'));
      if (this.checked) {
        this.closest('.radio-item').classList.add('selected');
      }
    });
  });

  // 多选
  container.querySelectorAll('.checkbox-item input').forEach(cb => {
    cb.addEventListener('change', function () {
      this.closest('.checkbox-item').classList.toggle('selected', this.checked);
    });
  });
}

// ========== 辅助 ==========

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
