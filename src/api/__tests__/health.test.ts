import { describe, it, expect, vi, beforeEach } from "vitest"

function makeMockClient() {
  const jsonFn = vi.fn()
  const getFn = vi.fn(() => ({ json: jsonFn }))
  return { get: getFn, _json: jsonFn }
}

const mockAdminClient = makeMockClient()
const mockPublicClient = makeMockClient()

vi.mock("../client", () => ({
  getApiClient: vi.fn(() => mockAdminClient),
  getPublicApiClient: vi.fn(() => mockPublicClient),
}))

vi.mock("@/lib/validation", () => ({
  safeParseWithLog: vi.fn((_schema, data) => data),
}))

import { healthApi } from "../health"

describe("healthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("alive", () => {
    it("calls admin/health/alive and returns parsed response", async () => {
      const data = { status: "ok" }
      mockAdminClient._json.mockResolvedValue(data)
      const result = await healthApi.alive()
      expect(mockAdminClient.get).toHaveBeenCalledWith("admin/health/alive")
      expect(result).toEqual(data)
    })
  })

  describe("ready", () => {
    it("calls admin/health/ready and returns parsed response", async () => {
      const data = { status: "ok" }
      mockAdminClient._json.mockResolvedValue(data)
      const result = await healthApi.ready()
      expect(mockAdminClient.get).toHaveBeenCalledWith("admin/health/ready")
      expect(result).toEqual(data)
    })
  })

  describe("publicAlive", () => {
    it("calls health/alive on public client", async () => {
      const data = { status: "ok" }
      mockPublicClient._json.mockResolvedValue(data)
      const result = await healthApi.publicAlive()
      expect(mockPublicClient.get).toHaveBeenCalledWith("health/alive")
      expect(result).toEqual(data)
    })
  })

  describe("version", () => {
    it("calls admin/version and returns parsed response", async () => {
      const data = { version: "v0.13.0" }
      mockAdminClient._json.mockResolvedValue(data)
      const result = await healthApi.version()
      expect(mockAdminClient.get).toHaveBeenCalledWith("admin/version")
      expect(result).toEqual(data)
    })
  })
})
