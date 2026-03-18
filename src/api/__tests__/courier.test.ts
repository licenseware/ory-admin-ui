import { describe, it, expect, vi, beforeEach } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJsonFn: any = vi.fn()
const mockResponse = {
  json: mockJsonFn,
  headers: new Headers(),
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetFn: any = vi.fn(() => mockResponse)

vi.mock("../client", () => ({
  getApiClient: vi.fn(() => ({ get: mockGetFn })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseArrayWithLog: vi.fn((_schema: unknown, data: unknown) => data),
  safeParseWithLog: vi.fn((_schema: unknown, data: unknown) => data),
}))

vi.mock("../pagination", () => ({
  parsePaginationHeaders: vi.fn(() => ({})),
}))

import { courierApi } from "../courier"
import { parsePaginationHeaders } from "../pagination"

describe("courierApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResponse.headers = new Headers()
  })

  describe("listMessages", () => {
    it("calls admin/courier/messages with no params", async () => {
      mockJsonFn.mockResolvedValue([])
      const result = await courierApi.listMessages()
      expect(mockGetFn).toHaveBeenCalledWith("admin/courier/messages", {
        searchParams: undefined,
      })
      expect(result).toEqual({ data: [], pagination: {} })
    })

    it("passes all search params", async () => {
      mockJsonFn.mockResolvedValue([])
      await courierApi.listMessages({
        page_size: 10,
        page_token: "tok",
        status: "sent",
        recipient: "user@test.com",
      })
      const call = mockGetFn.mock.calls[0]
      expect(call[0]).toBe("admin/courier/messages")
      const sp = call[1].searchParams as URLSearchParams
      expect(sp.get("page_size")).toBe("10")
      expect(sp.get("page_token")).toBe("tok")
      expect(sp.get("status")).toBe("sent")
      expect(sp.get("recipient")).toBe("user@test.com")
    })

    it("parses pagination headers from response", async () => {
      mockJsonFn.mockResolvedValue([])
      await courierApi.listMessages()
      expect(parsePaginationHeaders).toHaveBeenCalledWith(mockResponse.headers)
    })
  })

  describe("getMessage", () => {
    it("calls correct endpoint with id", async () => {
      const msg = { id: "msg-1", type: "email", status: "sent" }
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue(msg) })
      const result = await courierApi.getMessage("msg-1")
      expect(mockGetFn).toHaveBeenCalledWith("admin/courier/messages/msg-1")
      expect(result).toEqual(msg)
    })
  })
})
