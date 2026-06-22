/**
 * 简易 Hash 路由器
 *
 * 路由表:
 *   #/login          - 登录页
 *   #/dashboard      - 首页/仪表盘
 *   #/create         - 创建活动
 *   #/edit/:id       - 编辑活动基本信息
 *   #/builder/:id    - 表单构建器（自定义收集核心）
 *   #/publish/:id    - 发布/分享
 *   #/data/:id       - 数据查看
 *   #/form/:id       - 公开报名表单（无需登录）
 */

let currentCleanup = null; // 离开页面时的清理函数

/**
 * 监听 hash 变化，自动路由
 * @param {Object} routes - { pathPattern: renderFunction }
 */
export function startRouter(routes) {
  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || '/dashboard';

    // 调用上一个页面的清理函数
    if (currentCleanup) {
      try { currentCleanup(); } catch (e) { /* ignore */ }
      currentCleanup = null;
    }

    // 匹配路由: 支持 /builder/:id 这种模式
    let matched = false;
    for (const [pattern, renderFn] of Object.entries(routes)) {
      const result = matchRoute(pattern, hash);
      if (result) {
        document.getElementById('app').scrollTop = 0;
        currentCleanup = renderFn(result.params);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // 默认跳转到仪表盘
      window.location.hash = '#/dashboard';
    }
  }

  window.addEventListener('hashchange', handleRoute);
  // 首次加载
  handleRoute();
}

/**
 * 简易路由匹配
 * "/builder/:id" 匹配 "/builder/abc123" => { params: { id: "abc123" } }
 */
function matchRoute(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return { params };
}

/** 编程式导航 */
export function navigate(hash) {
  window.location.hash = hash;
}

/** 返回上一页 */
export function goBack() {
  window.history.back();
}
