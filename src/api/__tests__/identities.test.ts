import { describe, it, expect, vi, beforeEach } from "vitest"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockJsonFn: any = vi.fn()
const mockResponse = {
  json: mockJsonFn,
  headers: new Headers(),
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetFn: any = vi.fn(() => mockResponse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPostFn: any = vi.fn(() => ({ json: mockJsonFn }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPutFn: any = vi.fn(() => ({ json: mockJsonFn }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPatchFn: any = vi.fn(() => ({ json: mockJsonFn }))
const mockDeleteFn = vi.fn(() => Promise.resolve())

vi.mock("../client", () => ({
  getApiClient: vi.fn(() => ({
    get: mockGetFn,
    post: mockPostFn,
    put: mockPutFn,
    patch: mockPatchFn,
    delete: mockDeleteFn,
  })),
}))

vi.mock("@/lib/validation", () => ({
  safeParseArrayWithLog: vi.fn((_schema: unknown, data: unknown) => data),
  safeParseWithLog: vi.fn((_schema: unknown, data: unknown) => data),
}))

vi.mock("../pagination", () => ({
  parsePaginationHeaders: vi.fn(() => ({})),
}))

import { identitiesApi } from "../identities"

describe("identitiesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResponse.headers = new Headers()
  })

  describe("list", () => {
    it("calls admin/identities with no params", async () => {
      mockJsonFn.mockResolvedValue([])
      const result = await identitiesApi.list()
      expect(mockGetFn).toHaveBeenCalledWith("admin/identities", {
        searchParams: undefined,
      })
      expect(result).toEqual({ data: [], pagination: {} })
    })

    it("passes pagination params", async () => {
      mockJsonFn.mockResolvedValue([])
      await identitiesApi.list({ page_size: 20, page_token: "tok" })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("page_size")).toBe("20")
      expect(sp.get("page_token")).toBe("tok")
    })

    it("passes credentials_identifier", async () => {
      mockJsonFn.mockResolvedValue([])
      await identitiesApi.list({ credentials_identifier: "user@test.com" })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("credentials_identifier")).toBe("user@test.com")
    })

    it("passes preview_credentials_identifier_similar", async () => {
      mockJsonFn.mockResolvedValue([])
      await identitiesApi.list({ preview_credentials_identifier_similar: "user" })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("preview_credentials_identifier_similar")).toBe("user")
    })

    it("passes multiple ids", async () => {
      mockJsonFn.mockResolvedValue([])
      await identitiesApi.list({ ids: ["id1", "id2"] })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.getAll("ids")).toEqual(["id1", "id2"])
    })
  })

  describe("get", () => {
    it("calls admin/identities/:id with no credentials", async () => {
      const identity = { id: "id-1" }
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue(identity) })
      const result = await identitiesApi.get("id-1")
      expect(mockGetFn).toHaveBeenCalledWith("admin/identities/id-1", {
        searchParams: undefined,
      })
      expect(result).toEqual(identity)
    })

    it("passes include_credential params", async () => {
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue({ id: "id-1" }) })
      await identitiesApi.get("id-1", ["password", "oidc"])
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.getAll("include_credential")).toEqual(["password", "oidc"])
    })
  })

  describe("create", () => {
    it("POSTs to admin/identities with JSON body", async () => {
      const body = { schema_id: "default", traits: { email: "a@b.com" } }
      const created = { id: "new-id", ...body }
      mockJsonFn.mockResolvedValue(created)
      const result = await identitiesApi.create(body)
      expect(mockPostFn).toHaveBeenCalledWith("admin/identities", { json: body })
      expect(result).toEqual(created)
    })
  })

  describe("update", () => {
    it("PUTs to admin/identities/:id with JSON body", async () => {
      const body = { schema_id: "default", state: "active" as const, traits: {} }
      const updated = { id: "id-1", ...body }
      mockJsonFn.mockResolvedValue(updated)
      const result = await identitiesApi.update("id-1", body)
      expect(mockPutFn).toHaveBeenCalledWith("admin/identities/id-1", { json: body })
      expect(result).toEqual(updated)
    })
  })

  describe("patch", () => {
    it("PATCHes to admin/identities/:id with a JSON Patch array (RFC 6902)", async () => {
      const patch = [{ op: "replace" as const, path: "/state", value: "inactive" }]
      const patched = { id: "id-1", state: "inactive" }
      mockJsonFn.mockResolvedValue(patched)
      const result = await identitiesApi.patch("id-1", patch)
      expect(mockPatchFn).toHaveBeenCalledWith("admin/identities/id-1", { json: patch })
      expect(result).toEqual(patched)
    })
  })

  describe("delete", () => {
    it("DELETEs admin/identities/:id", async () => {
      await identitiesApi.delete("id-1")
      expect(mockDeleteFn).toHaveBeenCalledWith("admin/identities/id-1")
    })
  })

  describe("deleteCredential", () => {
    it("DELETEs admin/identities/:id/credentials/:type", async () => {
      await identitiesApi.deleteCredential("id-1", "password")
      expect(mockDeleteFn).toHaveBeenCalledWith("admin/identities/id-1/credentials/password", {
        searchParams: undefined,
      })
    })

    it("passes identifier query param for oidc/saml", async () => {
      await identitiesApi.deleteCredential("id-1", "oidc", "google:12345")
      expect(mockDeleteFn).toHaveBeenCalledWith(
        "admin/identities/id-1/credentials/oidc",
        expect.objectContaining({
          searchParams: expect.any(URLSearchParams),
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sp = (mockDeleteFn.mock.lastCall as any[])[1].searchParams as URLSearchParams
      expect(sp.get("identifier")).toBe("google:12345")
    })
  })

  describe("getSessions", () => {
    it("calls admin/identities/:id/sessions with no params", async () => {
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue([]) })
      const result = await identitiesApi.getSessions("id-1")
      expect(mockGetFn).toHaveBeenCalledWith("admin/identities/id-1/sessions", {
        searchParams: undefined,
      })
      expect(result).toEqual([])
    })

    it("passes active param", async () => {
      mockGetFn.mockReturnValue({ json: vi.fn().mockResolvedValue([]) })
      await identitiesApi.getSessions("id-1", { active: true })
      const sp = mockGetFn.mock.calls[0][1].searchParams as URLSearchParams
      expect(sp.get("active")).toBe("true")
    })
  })

  describe("deleteSessions", () => {
    it("DELETEs admin/identities/:id/sessions", async () => {
      await identitiesApi.deleteSessions("id-1")
      expect(mockDeleteFn).toHaveBeenCalledWith("admin/identities/id-1/sessions")
    })
  })

  describe("createRecoveryLink", () => {
    it("POSTs to admin/recovery/link with identity_id", async () => {
      const response = { recovery_link: "https://recover.test/link", expires_at: "2025-01-01" }
      mockJsonFn.mockResolvedValue(response)
      const result = await identitiesApi.createRecoveryLink("id-1")
      expect(mockPostFn).toHaveBeenCalledWith("admin/recovery/link", {
        json: { identity_id: "id-1", expires_in: undefined },
      })
      expect(result).toEqual(response)
    })

    it("passes expiresIn when provided", async () => {
      mockJsonFn.mockResolvedValue({ recovery_link: "link" })
      await identitiesApi.createRecoveryLink("id-1", "1h")
      expect(mockPostFn).toHaveBeenCalledWith("admin/recovery/link", {
        json: { identity_id: "id-1", expires_in: "1h" },
      })
    })
  })

  describe("createRecoveryCode", () => {
    it("POSTs to admin/recovery/code with identity_id", async () => {
      const response = { recovery_link: "link", recovery_code: "123456" }
      mockJsonFn.mockResolvedValue(response)
      const result = await identitiesApi.createRecoveryCode("id-1")
      expect(mockPostFn).toHaveBeenCalledWith("admin/recovery/code", {
        json: { identity_id: "id-1", expires_in: undefined },
      })
      expect(result).toEqual(response)
    })

    it("passes expiresIn when provided", async () => {
      mockJsonFn.mockResolvedValue({ recovery_link: "link", recovery_code: "code" })
      await identitiesApi.createRecoveryCode("id-1", "30m")
      expect(mockPostFn).toHaveBeenCalledWith("admin/recovery/code", {
        json: { identity_id: "id-1", expires_in: "30m" },
      })
    })
  })
})
