import { ref, watch } from 'vue'

const STORAGE_KEY = 'grid-order'

/**
 * 网格项排序顺序（只存储 ID 数组）
 * 存储在 localStorage，不同步到数据库
 */
export const gridOrder = ref<string[]>(loadOrder())

function loadOrder(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveOrder(order: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}

// 自动持久化
watch(gridOrder, saveOrder, { deep: true })

/**
 * 更新排序（拖拽后调用）
 */
export function updateGridOrder(ids: string[]) {
  gridOrder.value = ids
}

/**
 * 添加新项到末尾
 */
export function appendToOrder(id: string) {
  if (!gridOrder.value.includes(id)) {
    gridOrder.value.push(id)
  }
}

/**
 * 从排序中移除
 */
export function removeFromOrder(id: string) {
  const index = gridOrder.value.indexOf(id)
  if (index !== -1) {
    gridOrder.value.splice(index, 1)
  }
}

/**
 * 根据排序顺序对数组排序
 * 不在 gridOrder 中的项会放到末尾
 */
export function sortByOrder<T extends { id: string }>(items: T[]): T[] {
  const orderMap = new Map(gridOrder.value.map((id, index) => [id, index]))

  return [...items].sort((a, b) => {
    const orderA = orderMap.get(a.id) ?? Infinity
    const orderB = orderMap.get(b.id) ?? Infinity
    return orderA - orderB
  })
}
