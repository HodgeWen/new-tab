import { readonly, useTemplateRef, type TemplateRef } from 'vue'

import type { FolderModal } from '@/components/folder-modal'
import type { SettingModal } from '@/components/setting-modal'
import type { SiteModal } from '@/components/site-modal'

export type Modals = {
  folder: TemplateRef<InstanceType<typeof FolderModal>>
  site: TemplateRef<InstanceType<typeof SiteModal>>
  setting: TemplateRef<InstanceType<typeof SettingModal>>
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
