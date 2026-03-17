import { describe, it, expect, vi, beforeEach } from "vitest"

const mockJsonFn = vi.fn()
const mockGetFn = vi.fn(() => ({ json: mockJsonFn }))

vi.mock("../client", () => ({
  getOathkeeperApiClient: vi.fn(() => ({ get: mockGetFn })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseWithLog: vi.fn((_schema, data) => data),
  safeParseArrayWithLog: vi.fn((_schema, data) => data),
}))

import { oathkeeperApi } from "../oathkeeper"

describe("oathkeeperApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("listRules", () => {
    it("calls rules with no params", async () => {
      mockJsonFn.mockResolvedValue([])
      const result = await oathkeeperApi.listRules()
      expect(mockGetFn).toHaveBeenCalledWith("rules", {
        searchParams: undefined,
      })
      expect(result).toEqual([])
    })

    it("passes limit and offset params", async () => {
      mockJsonFn.mockResolvedValue([])
      await oathkeeperApi.listRules({ limit: 10, offset: 20 })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("limit")).toBe("10")
      expect(sp.get("offset")).toBe("20")
    })

    it("handles limit=0 and offset=0 correctly (uses !== undefined)", async () => {
      mockJsonFn.mockResolvedValue([])
      await oathkeeperApi.listRules({ limit: 0, offset: 0 })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("limit")).toBe("0")
      expect(sp.get("offset")).toBe("0")
    })
  })

  describe("getRule", () => {
    it("calls rules/:id with encoded id", async () => {
      const rule = { id: "rule:with/special" }
      mockJsonFn.mockResolvedValue(rule)
      const result = await oathkeeperApi.getRule("rule:with/special")
      expect(mockGetFn).toHaveBeenCalledWith(`rules/${encodeURIComponent("rule:with/special")}`)
      expect(result).toEqual(rule)
    })
  })

  describe("getHealth", () => {
    it("calls health/alive", async () => {
      const data = { status: "ok" }
      mockJsonFn.mockResolvedValue(data)
      const result = await oathkeeperApi.getHealth()
      expect(mockGetFn).toHaveBeenCalledWith("health/alive")
      expect(result).toEqual(data)
    })
  })

  describe("getReady", () => {
    it("calls health/ready", async () => {
      const data = { status: "ok" }
      mockJsonFn.mockResolvedValue(data)
      const result = await oathkeeperApi.getReady()
      expect(mockGetFn).toHaveBeenCalledWith("health/ready")
      expect(result).toEqual(data)
    })
  })

  describe("getVersion", () => {
    it("calls version endpoint", async () => {
      const data = { version: "v0.40.0" }
      mockJsonFn.mockResolvedValue(data)
      const result = await oathkeeperApi.getVersion()
      expect(mockGetFn).toHaveBeenCalledWith("version")
      expect(result).toEqual(data)
    })
  })

  describe("getJWKS", () => {
    it("calls .well-known/jwks.json", async () => {
      const data = { keys: [{ kid: "k1", kty: "RSA" }] }
      mockJsonFn.mockResolvedValue(data)
      const result = await oathkeeperApi.getJWKS()
      expect(mockGetFn).toHaveBeenCalledWith(".well-known/jwks.json")
      expect(result).toEqual(data)
    })
  })
})
