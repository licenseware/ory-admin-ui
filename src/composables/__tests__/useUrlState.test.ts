import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ref } from "vue"
import { useUrlState } from "../useUrlState"

// Mock vue-router
const mockQuery = ref<Record<string, string>>({})
const mockReplace = vi.fn()

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get query() {
      return mockQuery.value
    },
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe("useUrlState", () => {
  beforeEach(() => {
    mockQuery.value = {}
    mockReplace.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns default values when URL has no query params", () => {
    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
      page: { key: "page", defaultValue: 1, transform: { parse: Number, serialize: String } },
    })

    expect(state.search).toBe("")
    expect(state.page).toBe(1)
  })

  it("reads initial values from URL query params", () => {
    mockQuery.value = { search: "hello", page: "3" }

    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
      page: { key: "page", defaultValue: 1, transform: { parse: Number, serialize: String } },
    })

    expect(state.search).toBe("hello")
    expect(state.page).toBe(3)
  })

  it("omits default values from URL when syncing", async () => {
    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
      status: { key: "status", defaultValue: "all" },
    })

    state.search = "test"
    await vi.advanceTimersByTimeAsync(20)

    expect(mockReplace).toHaveBeenCalledWith({
      query: { search: "test" },
    })
  })

  it("updates URL when state changes", async () => {
    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
      sort: { key: "sort", defaultValue: "created_at:desc" },
    })

    state.search = "foo"
    state.sort = "name:asc"
    await vi.advanceTimersByTimeAsync(20)

    expect(mockReplace).toHaveBeenCalledWith({
      query: { search: "foo", sort: "name:asc" },
    })
  })

  it("batches multiple changes within debounce window into single replace", async () => {
    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
      status: { key: "status", defaultValue: "all" },
    })

    state.search = "test"
    state.status = "active"
    await vi.advanceTimersByTimeAsync(20)

    expect(mockReplace).toHaveBeenCalledTimes(1)
  })

  it("falls back to default for invalid numeric values", () => {
    mockQuery.value = { page: "banana" }

    const { state } = useUrlState({
      page: { key: "page", defaultValue: 1, transform: { parse: Number, serialize: String } },
    })

    expect(state.page).toBe(1)
  })

  it("reset() restores all fields to defaults and clears URL", async () => {
    mockQuery.value = { search: "hello", status: "active" }

    const { state, reset } = useUrlState({
      search: { key: "search", defaultValue: "" },
      status: { key: "status", defaultValue: "all" },
    })

    expect(state.search).toBe("hello")
    reset()
    expect(state.search).toBe("")
    expect(state.status).toBe("all")

    await vi.advanceTimersByTimeAsync(20)
    expect(mockReplace).toHaveBeenCalledWith({ query: {} })
  })

  it("preserves query params not managed by this instance", async () => {
    mockQuery.value = { profile: "prod", search: "old" }

    const { state } = useUrlState({
      search: { key: "search", defaultValue: "" },
    })

    state.search = "new"
    await vi.advanceTimersByTimeAsync(20)

    expect(mockReplace).toHaveBeenCalledWith({
      query: { profile: "prod", search: "new" },
    })
  })

  it("supports per-field debounce option", async () => {
    const { state, debounced } = useUrlState({
      search: { key: "search", defaultValue: "", debounce: 300 },
      status: { key: "status", defaultValue: "all" },
    })

    // Write to debounced ref
    debounced.search.value = "hello"

    // State not yet updated
    expect(state.search).toBe("")

    // After debounce, state updates
    await vi.advanceTimersByTimeAsync(300)
    expect(state.search).toBe("hello")

    // URL syncs after batch window
    await vi.advanceTimersByTimeAsync(20)
    expect(mockReplace).toHaveBeenCalledWith({
      query: { search: "hello" },
    })
  })

  it("reset() clears debounced refs too", async () => {
    mockQuery.value = { search: "initial" }

    const { debounced, reset, state } = useUrlState({
      search: { key: "search", defaultValue: "", debounce: 300 },
    })

    debounced.search.value = "modified"
    await vi.advanceTimersByTimeAsync(300)
    expect(state.search).toBe("modified")

    reset()
    expect(state.search).toBe("")
    // debounced ref should sync back
    await vi.advanceTimersByTimeAsync(1)
    expect(debounced.search.value).toBe("")
  })
})
