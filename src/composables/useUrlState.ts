import { reactive, watch, toRaw } from "vue"
import { useRoute, useRouter } from "vue-router"

export interface UrlStateField<T = unknown> {
  /** Query param key in the URL */
  key: string
  /** Value that will be omitted from URL */
  defaultValue: T
  /** Custom parse/serialize for non-string types */
  transform?: {
    parse: (raw: string) => T
    serialize: (value: T) => string
  }
}

type FieldDefs = Record<string, UrlStateField>
type StateFromDefs<T extends FieldDefs> = {
  [K in keyof T]: T[K]["defaultValue"]
}

export function useUrlState<T extends FieldDefs>(fields: T) {
  const route = useRoute()
  const router = useRouter()

  // Build initial state from URL or defaults
  const initial: Record<string, unknown> = {}
  for (const [name, field] of Object.entries(fields)) {
    const raw = route.query[field.key]
    if (typeof raw === "string" && raw !== "") {
      if (field.transform) {
        const parsed = field.transform.parse(raw)
        // Fall back to default if parse produces NaN (for numeric transforms)
        initial[name] = Number.isNaN(parsed) ? field.defaultValue : parsed
      } else {
        initial[name] = raw
      }
    } else {
      initial[name] = field.defaultValue
    }
  }

  const state = reactive(initial) as StateFromDefs<T>

  // Debounced URL sync
  let timer: ReturnType<typeof setTimeout> | undefined

  function syncToUrl() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const query: Record<string, string> = {}

      // Preserve unmanaged query params (e.g. ?profile=)
      const managedKeys = new Set(Object.values(fields).map((f) => f.key))
      for (const [k, v] of Object.entries(route.query)) {
        if (!managedKeys.has(k) && typeof v === "string") {
          query[k] = v
        }
      }

      // Add managed params, omitting defaults
      for (const [name, field] of Object.entries(fields)) {
        const value = toRaw((state as Record<string, unknown>)[name])
        if (value !== field.defaultValue) {
          query[field.key] = field.transform
            ? field.transform.serialize(value as never)
            : String(value)
        }
      }

      router.replace({ query })
    }, 100)
  }

  // Watch all state fields for changes
  watch(
    () => Object.values(toRaw({ ...state })),
    () => syncToUrl(),
    { deep: true }
  )

  function reset() {
    for (const [name, field] of Object.entries(fields)) {
      ;(state as Record<string, unknown>)[name] = field.defaultValue
    }
  }

  return { state, reset }
}
