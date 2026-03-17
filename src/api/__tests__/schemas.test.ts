import { describe, it, expect, vi, beforeEach } from "vitest"

const mockJsonFn = vi.fn()
const mockGetFn = vi.fn(() => ({ json: mockJsonFn }))

vi.mock("../client", () => ({
  getPublicApiClient: vi.fn(() => ({ get: mockGetFn })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseArrayWithLog: vi.fn((_schema, data) => data),
}))

import { schemasApi } from "../schemas"

describe("schemasApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("list", () => {
    it("calls schemas with no params", async () => {
      mockJsonFn.mockResolvedValue([])
      const result = await schemasApi.list()
      expect(mockGetFn).toHaveBeenCalledWith("schemas", {
        searchParams: undefined,
      })
      expect(result).toEqual([])
    })

    it("passes pagination params", async () => {
      mockJsonFn.mockResolvedValue([])
      await schemasApi.list({ page_size: 5, page_token: "abc" })
      const call = mockGetFn.mock.calls[0]
      const sp = call[1].searchParams as URLSearchParams
      expect(sp.get("page_size")).toBe("5")
      expect(sp.get("page_token")).toBe("abc")
    })
  })

  describe("get", () => {
    it("calls schemas/:id and returns JSON", async () => {
      const schema = { type: "object", properties: {} }
      mockJsonFn.mockResolvedValue(schema)
      const result = await schemasApi.get("default")
      expect(mockGetFn).toHaveBeenCalledWith("schemas/default")
      expect(result).toEqual(schema)
    })
  })
})
