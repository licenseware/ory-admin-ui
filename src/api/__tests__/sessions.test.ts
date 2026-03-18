import { describe, it, expect, vi, beforeEach } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJsonFn: any = vi.fn()
const mockResponse = {
  json: mockJsonFn,
  headers: new Headers(),
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetFn: any = vi.fn(() => mockResponse)
const mockDeleteFn = vi.fn(() => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPatchFn: any = vi.fn(() => ({ json: mockJsonFn }))

vi.mock("../client", () => ({
  getApiClient: vi.fn(() => ({
    get: mockGetFn,
    delete: mockDeleteFn,
    patch: mockPatchFn,
  })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseArrayWithLog: vi.fn((_schema: unknown, data: unknown) => data),
  safeParseWithLog: vi.fn((_schema: unknown, data: unknown) => data),
}))

vi.mock("../pagination", () => ({
  parsePaginationHeaders: vi.fn(() => ({})),
}))

import { sessionsApi } from "../sessions"

describe("sessionsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResponse.headers = new Headers()
  })

  describe("list", () => {
    it("calls admin/sessions with no params", async () => {
      mockJsonFn.mockResolvedValue([])
      const result = await sessionsApi.list()
      expect(mockGetFn).toHaveBeenCalledWith("admin/sessions", {
        searchParams: undefined,
      })
      expect(result).toEqual({ data: [], pagination: {} })
    })

    it("passes active and expand params", async () => {
      mockJsonFn.mockResolvedValue([])
      await sessionsApi.list({
        active: true,
        expand: ["identity", "devices"],
      })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("active")).toBe("true")
      expect(sp.getAll("expand")).toEqual(["identity", "devices"])
    })

    it("handles active=false correctly", async () => {
      mockJsonFn.mockResolvedValue([])
      await sessionsApi.list({ active: false })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("active")).toBe("false")
    })
  })

  describe("get", () => {
    it("calls admin/sessions/:id with no expand", async () => {
      const session = { id: "s-1", active: true }
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue(session) })
      const result = await sessionsApi.get("s-1")
      expect(mockGetFn).toHaveBeenCalledWith("admin/sessions/s-1", {
        searchParams: undefined,
      })
      expect(result).toEqual(session)
    })

    it("passes expand params", async () => {
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue({ id: "s-1" }) })
      await sessionsApi.get("s-1", ["identity"])
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.getAll("expand")).toEqual(["identity"])
    })
  })

  describe("disable", () => {
    it("calls DELETE on admin/sessions/:id", async () => {
      await sessionsApi.disable("s-1")
      expect(mockDeleteFn).toHaveBeenCalledWith("admin/sessions/s-1")
    })
  })

  describe("extend", () => {
    it("calls PATCH on admin/sessions/:id/extend", async () => {
      const session = { id: "s-1", active: true }
      mockJsonFn.mockResolvedValue(session)
      const result = await sessionsApi.extend("s-1")
      expect(mockPatchFn).toHaveBeenCalledWith("admin/sessions/s-1/extend")
      expect(result).toEqual(session)
    })
  })
})
