import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("ky", () => ({
  default: {
    create: vi.fn(() => "mock-client-instance"),
  },
}))

vi.mock("@/stores/profile", () => ({
  useProfileStore: vi.fn(() => ({
    kratosAdminBaseURL: "http://admin.test",
    kratosPublicBaseURL: "http://public.test",
    oathkeeperApiBaseURL: "http://oathkeeper.test",
  })),
}))

import ky from "ky"
import {
  createApiClient,
  getApiClient,
  resetApiClient,
  createPublicApiClient,
  getPublicApiClient,
  resetPublicApiClient,
  createOathkeeperApiClient,
  getOathkeeperApiClient,
  resetOathkeeperApiClient,
} from "../client"

describe("client", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetApiClient()
    resetPublicApiClient()
    resetOathkeeperApiClient()
  })

  describe("createApiClient", () => {
    it("calls ky.create with admin prefixUrl", () => {
      createApiClient()
      expect(ky.create).toHaveBeenCalledWith(
        expect.objectContaining({ prefixUrl: "http://admin.test" })
      )
    })
  })

  describe("getApiClient", () => {
    it("creates client on first call", () => {
      getApiClient()
      expect(ky.create).toHaveBeenCalledTimes(1)
    })

    it("returns cached client on subsequent calls", () => {
      const first = getApiClient()
      const second = getApiClient()
      expect(first).toBe(second)
      expect(ky.create).toHaveBeenCalledTimes(1)
    })
  })

  describe("resetApiClient", () => {
    it("clears cached client so next getApiClient creates fresh", () => {
      getApiClient()
      expect(ky.create).toHaveBeenCalledTimes(1)
      resetApiClient()
      getApiClient()
      expect(ky.create).toHaveBeenCalledTimes(2)
    })
  })

  describe("createPublicApiClient", () => {
    it("calls ky.create with public prefixUrl", () => {
      createPublicApiClient()
      expect(ky.create).toHaveBeenCalledWith(
        expect.objectContaining({ prefixUrl: "http://public.test" })
      )
    })
  })

  describe("getPublicApiClient", () => {
    it("creates client on first call", () => {
      getPublicApiClient()
      expect(ky.create).toHaveBeenCalledTimes(1)
    })

    it("returns cached client on subsequent calls", () => {
      const first = getPublicApiClient()
      const second = getPublicApiClient()
      expect(first).toBe(second)
      expect(ky.create).toHaveBeenCalledTimes(1)
    })
  })

  describe("resetPublicApiClient", () => {
    it("clears cached client so next getPublicApiClient creates fresh", () => {
      getPublicApiClient()
      resetPublicApiClient()
      getPublicApiClient()
      expect(ky.create).toHaveBeenCalledTimes(2)
    })
  })

  describe("createOathkeeperApiClient", () => {
    it("calls ky.create with oathkeeper prefixUrl", () => {
      createOathkeeperApiClient()
      expect(ky.create).toHaveBeenCalledWith(
        expect.objectContaining({ prefixUrl: "http://oathkeeper.test" })
      )
    })
  })

  describe("getOathkeeperApiClient", () => {
    it("creates client on first call", () => {
      getOathkeeperApiClient()
      expect(ky.create).toHaveBeenCalledTimes(1)
    })

    it("returns cached client on subsequent calls", () => {
      const first = getOathkeeperApiClient()
      const second = getOathkeeperApiClient()
      expect(first).toBe(second)
      expect(ky.create).toHaveBeenCalledTimes(1)
    })
  })

  describe("resetOathkeeperApiClient", () => {
    it("clears cached client so next getOathkeeperApiClient creates fresh", () => {
      getOathkeeperApiClient()
      resetOathkeeperApiClient()
      getOathkeeperApiClient()
      expect(ky.create).toHaveBeenCalledTimes(2)
    })
  })
})
