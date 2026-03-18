import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"

vi.mock("@tanstack/vue-query", () => ({
  useQuery: vi.fn(() => ({ data: ref(null), isLoading: ref(false), error: ref(null) })),
}))

vi.mock("@/api/schemas", () => ({
  schemasApi: {
    list: vi.fn(),
    get: vi.fn(),
  },
}))

import { useSchemas, useSchema } from "../useSchemas"

describe("useSchemas composables", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useSchemas returns query result", () => {
    expect(useSchemas()).toBeDefined()
  })

  it("useSchemas accepts params ref", () => {
    expect(useSchemas(ref({ page_size: 10 }))).toBeDefined()
  })

  it("useSchema returns query result for given id", () => {
    expect(useSchema(ref("default"))).toBeDefined()
  })
})
