import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/validation", () => ({
  safeParseWithLog: vi.fn((_schema, data) => data),
}))

describe("config/loader", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    sessionStorage.clear()
    vi.stubGlobal("fetch", vi.fn())
  })

  async function importLoader() {
    return await import("../loader")
  }

  describe("getRuntimeProfiles", () => {
    it("returns null before loadRuntimeProfiles is called", async () => {
      const { getRuntimeProfiles } = await importLoader()
      expect(getRuntimeProfiles()).toBeNull()
    })
  })

  describe("loadRuntimeProfiles", () => {
    it("fetches /config.json and returns profiles", async () => {
      const profiles = { prod: { kratosAdminBaseURL: "http://admin.prod" } }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(profiles),
      })
      vi.stubGlobal("fetch", mockFetch)

      const { loadRuntimeProfiles, getRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()

      expect(mockFetch).toHaveBeenCalledWith("/config.json", { cache: "no-cache" })
      expect(result).toEqual(profiles)
      expect(getRuntimeProfiles()).toEqual(profiles)
    })

    it("caches in sessionStorage after fetch", async () => {
      const profiles = { staging: { kratosAdminBaseURL: "http://admin.staging" } }
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(profiles),
        })
      )

      const { loadRuntimeProfiles } = await importLoader()
      await loadRuntimeProfiles()

      const cached = sessionStorage.getItem("runtime-profiles")
      expect(cached).toBeTruthy()
      const parsed = JSON.parse(cached!)
      expect(parsed.profiles).toEqual(profiles)
      expect(typeof parsed.timestamp).toBe("number")
    })

    it("returns cached profiles on second call within TTL", async () => {
      const profiles = { local: { kratosAdminBaseURL: "http://localhost:4434" } }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(profiles),
      })
      vi.stubGlobal("fetch", mockFetch)

      const { loadRuntimeProfiles } = await importLoader()
      await loadRuntimeProfiles()
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call should use cache (need fresh module to reset runtimeProfiles)
      vi.resetModules()
      const { loadRuntimeProfiles: load2 } = await importLoader()
      const result = await load2()
      expect(result).toEqual(profiles)
    })

    it("returns empty object on 404 (graceful degradation)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
        })
      )

      const { loadRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()
      expect(result).toEqual({})
    })

    it("returns empty object on 500 and logs warning", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        })
      )

      const { loadRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()
      expect(result).toEqual({})
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it("returns empty object on network error", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")))

      const { loadRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()
      expect(result).toEqual({})
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it("handles invalid JSON in sessionStorage cache", async () => {
      sessionStorage.setItem("runtime-profiles", "not-json{{{")

      const profiles = { fresh: { kratosAdminBaseURL: "http://fresh" } }
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(profiles),
        })
      )

      const { loadRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()
      expect(result).toEqual(profiles)
    })

    it("re-fetches after TTL expires", async () => {
      // Seed cache with expired timestamp
      const expired = {
        profiles: { old: { kratosAdminBaseURL: "http://old" } },
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (TTL is 5 min)
      }
      sessionStorage.setItem("runtime-profiles", JSON.stringify(expired))

      const freshProfiles = { new: { kratosAdminBaseURL: "http://new" } }
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(freshProfiles),
        })
      )

      const { loadRuntimeProfiles } = await importLoader()
      const result = await loadRuntimeProfiles()
      expect(result).toEqual(freshProfiles)
    })
  })
})
