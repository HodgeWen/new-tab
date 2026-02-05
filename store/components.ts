import { readonly, type TemplateRef } from 'vue'

import type { NFolderModal } from '@/components/folder-modal'
import type { NGridLayout } from '@/components/grid-layout'
import type { NSettingModal } from '@/components/setting-modal'
import type { NSiteModal } from '@/components/site-modal'

export type Components = {
  folder: TemplateRef<InstanceType<typeof NFolderModal>>
  site: TemplateRef<InstanceType<typeof NSiteModal>>
  setting: TemplateRef<InstanceType<typeof NSettingModal>>
  gridLayout: TemplateRef<InstanceType<typeof NGridLayout>>
}

const _components: Partial<Components> = {}

let connected = false

export const components = readonly(_components)

/**
 * 连接模态框组件实例，全局可连接一次
 * @param modals - 连接的模态框组件实例
 * @returns
 */
export function connectComponents(components: Components) {
  if (connected) return
  connected = true

  Object.assign(_components, components)
}
