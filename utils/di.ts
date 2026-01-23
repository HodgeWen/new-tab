import type { InjectionKey, TemplateRef } from 'vue'
import type { SiteEdit } from '@/components/site'
import type { FolderEdit } from '@/components/folder'

export const COMPONENTS_DI_KEY: InjectionKey<{
  siteEdit: TemplateRef<InstanceType<typeof SiteEdit>>
  folderEdit: TemplateRef<InstanceType<typeof FolderEdit>>
}> = Symbol('COMPONENTS_DI_KEY')
