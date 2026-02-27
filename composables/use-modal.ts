import { reactive, ref, watch } from 'vue'

type UnknownRecord = Record<string, unknown>

function isPlainObject(value: unknown): value is UnknownRecord {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function replaceObject(target: UnknownRecord, source: UnknownRecord) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key]
    }
  }

  for (const [key, value] of Object.entries(source)) {
    target[key] = cloneValue(value)
  }
}

function deepMerge(target: UnknownRecord, patch: UnknownRecord) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue

    const current = target[key]
    if (isPlainObject(value) && isPlainObject(current)) {
      deepMerge(current, value)
      continue
    }

    target[key] = cloneValue(value)
  }
}

export function useModal<T extends object>(data: T) {
  const visible = ref(false)
  const initialData = cloneValue(data)
  const form = reactive(cloneValue(data)) as T

  function resetForm() {
    replaceObject(form as UnknownRecord, initialData as UnknownRecord)
  }

  function open(patch?: Partial<T>) {
    resetForm()
    if (patch) {
      deepMerge(form as UnknownRecord, patch as UnknownRecord)
    }
    visible.value = true
  }

  watch(visible, (isVisible) => {
    if (isVisible) return
    resetForm()
  })

  return { visible, form, open }
}
