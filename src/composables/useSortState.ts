import { computed, type Reactive } from "vue"

/**
 * Extracts sortField and sortDir from a reactive URL state
 * containing a "field:direction" string.
 */
export function useSortState<TField extends string = string, TDir extends string = "asc" | "desc">(
  state: Reactive<Record<string, unknown>>,
  key: string
) {
  const sortValue = computed({
    get: () => state[key] as string,
    set: (val: string) => {
      state[key] = val
    },
  })

  const sortField = computed(() => (state[key] as string).split(":")[0] as TField)
  const sortDir = computed(() => (state[key] as string).split(":")[1] as TDir)

  return { sortValue, sortField, sortDir }
}
