import {
  reactive,
  watch,
  toRaw,
  ref,
  computed,
  onScopeDispose,
  type WritableComputedRef,
} from "vue"
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
  /** If set, returns a debounced WritableComputedRef for this field */
  debounce?: number
}

type StateFromDefs<T extends Record<string, UrlStateField>> = {
  [K in keyof T]: T[K] extends UrlStateField<infer V> ? V : unknown
}

type DebouncedRefs<T extends Record<string, UrlStateField>> = {
  [K in keyof T as T[K] extends { debounce: number } ? K : never]: WritableComputedRef<
    T[K] extends UrlStateField<infer V> ? V : unknown
  >
}

export function useUrlState<T extends Record<string, UrlStateField>>(fields: T) {
  const route = useRoute()
  const router = useRouter()

  // Build initial state from URL or defaults
  const initial: Record<string, unknown> = {}
  for (const [name, field] of Object.entries(fields)) {
    const raw = route.query[field.key]
    if (typeof raw === "string" && raw !== "") {
      if (field.transform) {
        const parsed = field.transform.parse(raw)
        initial[name] = Number.isNaN(parsed) ? field.defaultValue : parsed
      } else {
        initial[name] = raw
      }
    } else {
      initial[name] = field.defaultValue
    }
  }

  const state = reactive(initial) as StateFromDefs<T>

  // URL sync — small batch window (16ms ≈ 1 frame) to coalesce same-tick changes
  let syncTimer: ReturnType<typeof setTimeout> | undefined

  function syncToUrl() {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
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
    }, 16)
  }

  // Watch all state fields for changes
  watch(
    () => Object.values(toRaw({ ...state })),
    () => syncToUrl(),
    { deep: true }
  )

  // Build debounced refs for fields that request it
  const debounceTimers: ReturnType<typeof setTimeout>[] = []
  const debounced = {} as Record<string, WritableComputedRef<unknown>>

  for (const [name, field] of Object.entries(fields)) {
    if (field.debounce) {
      const local = ref(initial[name])
      let timer: ReturnType<typeof setTimeout> | undefined

      watch(local, (val) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          ;(state as Record<string, unknown>)[name] = val
        }, field.debounce)
        debounceTimers.push(timer!)
      })

      // Sync back: if state changes externally (e.g. reset), update local
      watch(
        () => (state as Record<string, unknown>)[name],
        (val) => {
          if (local.value !== val) local.value = val
        }
      )

      debounced[name] = computed({
        get: () => local.value,
        set: (v) => {
          local.value = v
        },
      })
    }
  }

  function reset() {
    for (const [name, field] of Object.entries(fields)) {
      ;(state as Record<string, unknown>)[name] = field.defaultValue
    }
  }

  // Cleanup all timers on scope dispose
  onScopeDispose(() => {
    clearTimeout(syncTimer)
    for (const t of debounceTimers) clearTimeout(t)
  })

  return {
    state,
    debounced: debounced as DebouncedRefs<T>,
    reset,
  }
}
