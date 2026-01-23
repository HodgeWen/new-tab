import { o } from '@cat-kit/core'
import { ref, reactive, watch } from 'vue'

export function useModal<T extends Record<string, any>>(data: T) {
  const visible = ref(false)

  const initialData = JSON.parse(JSON.stringify(data))
  const form = reactive<T>(data)

  function open(data?: T) {
    visible.value = true
    data && o(form).deepExtend(data)
  }

  watch(visible, v => {
    !v && Object.assign(form, initialData)
  })

  return { visible, form, open }
}
