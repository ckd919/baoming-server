/**
 * 数据查看页 V2 - 简易图表 + 列表/导出
 */
import { showToast, formatDateTime, exportCSV } from '../utils.js';
import { getActivity, getSubmissions, clearSubmissions } from '../store.js';
import { navigate, goBack } from '../router.js';

export function renderDataView(params = {}) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="navbar">
      <button class="navbar-back" id="back-btn">← 返回</button>
      <span class="navbar-title">报名数据</span>
    </div>
    <div class="page" style="padding-bottom:120px">
      <div id="data-content"><div class="text-center text-hint" style="padding:24px">加载中...</div></div>
    </div>
    <div id="bottom-area"></div>
  `;

  document.getElementById('back-btn').addEventListener('click', goBack);
  loadData();

  async function loadData() {
    try {
      const [activity, submissions] = await Promise.all([
        getActivity(params.id).catch(() => null),
        getSubmissions(params.id),
      ]);
      if (!activity) { showToast('活动不存在'); navigate('#/dashboard'); return; }

      const fields = activity.fields || [];
      const container = document.getElementById('data-content');

      if (submissions.length === 0) {
        container.innerHTML = `
          <div class="stats-row">
            <div class="stat-card-v2"><div class="stat-value">0</div><div class="stat-label">报名人数</div></div>
            <div class="stat-card-v2"><div class="stat-value">${fields.length}</div><div class="stat-label">收集字段</div></div>
            <div class="stat-card-v2"><div class="stat-value">0%</div><div class="stat-label">提交率</div></div>
          </div>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-title">暂无报名数据</div>
            <div class="empty-text">分享活动链接后，报名数据会实时显示在这里</div>
          </div>`;
        document.getElementById('bottom-area').innerHTML = '';
        return;
      }

      // 按日期统计（简易柱状图）
      const dateCount = {};
      submissions.forEach(s => {
        const date = new Date(s.submittedAt).toLocaleDateString('zh-CN', { month:'short', day:'numeric' });
        dateCount[date] = (dateCount[date] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(dateCount), 1);
      const chartHTML = Object.entries(dateCount).slice(-7).map(([date, count]) => `
        <div class="bar-col">
          <div>${count}</div>
          <div class="bar-fill" style="height:${Math.max(count/maxCount*80, 4)}px"></div>
          <div class="bar-lbl">${date}</div>
        </div>
      `).join('');

      // 表格
      const headers = ['序号', '提交时间', ...fields.map(f => f.label)];
      const rows = submissions.map((sub, i) => {
        const row = { '序号': i + 1, '提交时间': formatDateTime(sub.submittedAt) };
        fields.forEach(f => {
          const val = sub.data?.[f.id];
          row[f.label] = Array.isArray(val) ? val.join('、') : (val ?? '');
        });
        return row;
      });

      container.innerHTML = `
        <div class="stats-row">
          <div class="stat-card-v2"><div class="stat-value">${submissions.length}</div><div class="stat-label">报名人数</div></div>
          <div class="stat-card-v2"><div class="stat-value">${fields.length}</div><div class="stat-label">收集字段</div></div>
          <div class="stat-card-v2 accent"><div class="stat-value">${submissions.length}</div><div class="stat-label">总提交</div></div>
        </div>

        <div class="card">
          <div class="card-title mb-12">📊 提交趋势（近7天）</div>
          <div class="chart-bar">${chartHTML}</div>
        </div>

        <div class="card" style="padding:0">
          <div style="padding:14px 16px;border-bottom:1px solid var(--border-light)">
            <span style="font-weight:600">📋 详细数据</span>
          </div>
          <div class="data-table-wrapper" style="padding:0 8px 8px">
            <table class="data-table">
              <thead><tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr></thead>
              <tbody>${rows.map(row =>
                `<tr>${headers.map(h => `<td title="${escAttr(String(row[h]??''))}">${escHtml(String(row[h]??'-'))}</td>`).join('')}</tr>`
              ).join('')}</tbody>
            </table>
          </div>
        </div>`;

      document.getElementById('bottom-area').innerHTML = `
        <div class="fixed-bottom no-tab" style="display:flex;gap:12px">
          <button class="btn btn-outline flex-1" id="export-btn">📥 导出CSV</button>
          <button class="btn btn-danger-outline flex-1" id="clear-btn">🗑 清空</button>
        </div>`;

      document.getElementById('export-btn').addEventListener('click', () => {
        exportCSV(headers, rows, `${activity.name}_报名数据.csv`);
        showToast('导出成功！');
      });
      document.getElementById('clear-btn').addEventListener('click', async () => {
        if (!confirm('确定清空所有报名数据吗？不可恢复！')) return;
        try { await clearSubmissions(params.id); showToast('已清空'); loadData(); }
        catch (err) { showToast('清空失败: ' + err.message); }
      });
    } catch (err) {
      document.getElementById('data-content').innerHTML =
        `<div class="empty-state"><div class="empty-title">加载失败</div><div class="empty-text">${err.message}</div></div>`;
    }
  }

  return () => {};
}

function escHtml(str) { const d=document.createElement('div'); d.textContent=String(str??''); return d.innerHTML; }
function escAttr(str) { return String(str??'').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
