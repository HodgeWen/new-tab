import type { InjectionKey, TemplateRef } from 'vue'
import type { SiteEdit } from '@/components/site'
import type { FolderEdit, FolderModal } from '@/components/folder'
import type { GridContainer } from '@/components/grid'

export const COMPONENTS_DI_KEY: InjectionKey<{
  siteEdit: TemplateRef<InstanceType<typeof SiteEdit>>
  folderEdit: TemplateRef<InstanceType<typeof FolderEdit>>
  folderModal: TemplateRef<InstanceType<typeof FolderModal>>
  gridContainer: TemplateRef<InstanceType<typeof GridContainer>>
}> = Symbol('COMPONENTS_DI_KEY')
