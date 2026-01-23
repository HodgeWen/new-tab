import { TemplateRef } from 'vue'
import type { SiteEdit } from '@/components/site'

export const COMPONENTS_DI_KEY: InjectionKey<{
  siteEdit: TemplateRef<InstanceType<typeof SiteEdit>>
}> = Symbol('COMPONENTS_DI_KEY')
