import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"

vi.mock("@tanstack/vue-query", () => ({
  useQuery: vi.fn(() => ({ data: ref(null), isLoading: ref(false), error: ref(null) })),
}))

vi.mock("@/api/courier", () => ({
  courierApi: {
    listMessages: vi.fn(),
    getMessage: vi.fn(),
  },
}))

import { useMessages, useCourierMessages, useMessage } from "../useCourier"

describe("useCourier composables", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useMessages returns query result", () => {
    expect(useMessages()).toBeDefined()
  })

  it("useMessages accepts params ref", () => {
    expect(useMessages(ref({ pageSize: 10, status: "sent" as const }))).toBeDefined()
  })

  it("useCourierMessages is aliased to useMessages", () => {
    expect(useCourierMessages).toBe(useMessages)
  })

  it("useMessage returns query result for given id", () => {
    expect(useMessage(ref("msg-1"))).toBeDefined()
  })
})
