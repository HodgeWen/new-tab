import { readonly, type TemplateRef } from 'vue'

import type { NFolderModal } from '@/components/folder-modal'
import type { NSettingModal } from '@/components/setting-modal'
import type { NSiteModal } from '@/components/site-modal'

export type Modals = {
  folder: TemplateRef<InstanceType<typeof NFolderModal>>
  site: TemplateRef<InstanceType<typeof NSiteModal>>
  setting: TemplateRef<InstanceType<typeof NSettingModal>>
}

const _modals: Partial<Modals> = {}

let connected = false

export const modals = readonly(_modals)

/**
 * 连接模态框组件实例，全局可连接一次
 * @param modals - 连接的模态框组件实例
 * @returns
 */
export function connectModals(modals: Modals) {
  if (connected) return
  connected = true

  Object.assign(_modals, modals)
}
