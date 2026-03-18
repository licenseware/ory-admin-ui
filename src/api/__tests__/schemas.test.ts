import { describe, it, expect, vi, beforeEach } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJsonFn: any = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetFn: any = vi.fn(() => ({ json: mockJsonFn }))

vi.mock("../client", () => ({
  getPublicApiClient: vi.fn(() => ({ get: mockGetFn })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseArrayWithLog: vi.fn((_schema: unknown, data: unknown) => data),
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
      mockJsonFn.mockResolvedValue({ type: "object", properties: {} })
      const result = await schemasApi.get("default")
      expect(mockGetFn).toHaveBeenCalledWith("schemas/default")
      expect(result).toEqual({ type: "object", properties: {} })
    })
  })
})
