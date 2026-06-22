/**
 * 最近浏览记录 — 本地存储
 * 用于"我的记录"页面的"最近浏览"tab
 */

const STORAGE_KEY = 'bm_recent_views'
const MAX_ITEMS = 20

/**
 * 记录一次浏览
 * @param {Object} activity - { id, name, description, location, startTime }
 */
export function trackView(activity) {
  if (!activity || !activity.id) return
  const views = getRecentViews()
  // 去重
  const idx = views.findIndex(v => v.id === activity.id)
  if (idx >= 0) views.splice(idx, 1)
  // 插入最前面
  views.unshift({
    id: activity.id,
    name: activity.name || '',
    description: (activity.description || '').slice(0, 100),
    location: activity.location || '',
    startTime: activity.startTime || null,
    viewedAt: Date.now()
  })
  // 截断
  if (views.length > MAX_ITEMS) views.length = MAX_ITEMS
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(views))
}

/**
 * 获取最近浏览列表
 * @returns {Array}
 */
export function getRecentViews() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * 清空浏览记录
 */
export function clearRecentViews() {
  uni.removeStorageSync(STORAGE_KEY)
}
