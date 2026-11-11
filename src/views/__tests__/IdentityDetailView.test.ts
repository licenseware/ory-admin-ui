import { describe, it, expect, vi, beforeEach } from "vitest"
import { flushPromises } from "@vue/test-utils"
import { renderComponent } from "@/test/test-utils"
import { createIdentity, createSession } from "@/test/factories"
import type { Identity } from "@/types/api"

vi.mock("@/api/identities", () => ({
  identitiesApi: {
    get: vi.fn(),
    getSessions: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    createRecoveryLink: vi.fn(),
    createRecoveryCode: vi.fn(),
  },
}))

vi.mock("@/api/sessions", () => ({
  sessionsApi: {
    disable: vi.fn(),
  },
}))

vi.mock("@/api/client", () => ({
  getApiClient: vi.fn(),
  resetApiClient: vi.fn(),
  getPublicApiClient: vi.fn(),
  resetPublicApiClient: vi.fn(),
}))

vi.mock("@/config/loader", () => ({
  getRuntimeProfiles: vi.fn(() => null),
}))

import { identitiesApi } from "@/api/identities"
import IdentityDetailView from "../IdentityDetailView.vue"

const mockIdentity: Identity = createIdentity({
  id: "test-uuid-1234-5678-abcd-ef1234567890",
  traits: { email: "alice@example.com", username: "alice" },
  state: "active",
  schema_id: "default",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-06-01T12:00:00Z",
})

const mockSessions = [
  createSession({ active: true, identity: mockIdentity }),
  createSession({ active: true, identity: mockIdentity }),
]

describe("IdentityDetailView", () => {
  beforeEach(() => {
    vi.mocked(identitiesApi.get).mockResolvedValue(mockIdentity)
    vi.mocked(identitiesApi.getSessions).mockResolvedValue(mockSessions)
  })

  function renderDetail() {
    return renderComponent(IdentityDetailView, {
      initialRoute: "/identities/test-uuid-1234-5678-abcd-ef1234567890",
    })
  }

  it("renders identity name and ID after loading", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("alice@example.com")
    expect(wrapper.text()).toContain("test-uuid-1234-5678-abcd-ef1234567890")
  })

  it("shows active badge for active identity", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Active")
  })

  it("shows blocked badge for inactive identity", async () => {
    vi.mocked(identitiesApi.get).mockResolvedValue(
      createIdentity({ ...mockIdentity, state: "inactive" })
    )
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Blocked")
  })

  it("renders tabs for overview, sessions, credentials, raw JSON", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Overview")
    expect(wrapper.text()).toContain("Sessions")
    expect(wrapper.text()).toContain("Credentials")
    expect(wrapper.text()).toContain("Raw JSON")
  })

  it("shows schema ID in metadata", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("default")
  })

  it("shows loading skeletons initially", async () => {
    vi.mocked(identitiesApi.get).mockReturnValue(new Promise(() => {}))
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when identity fails to load", async () => {
    vi.mocked(identitiesApi.get).mockRejectedValue(new Error("Not found"))
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Failed to load identity")
  })

  it("renders Recovery Link button", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Recovery Link")
  })

  it("renders Block/Unblock button based on state", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Block")
  })

  it("shows Unblock for inactive identity", async () => {
    vi.mocked(identitiesApi.get).mockResolvedValue(
      createIdentity({ ...mockIdentity, state: "inactive" })
    )
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Unblock")
  })

  it("renders Delete button", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain("Delete")
  })

  it("opens delete confirmation dialog when Delete is clicked", async () => {
    const { wrapper, router } = renderDetail()
    await router.isReady()
    await flushPromises()

    const deleteBtn = wrapper.findAll("button").find((b) => b.text().includes("Delete"))!
    await deleteBtn.trigger("click")
    await flushPromises()

    // AlertDialog content is rendered via radix-vue portal (teleported).
    // Verify the dialog is opened by checking that an AlertDialogRoot has open=true.
    const alertDialogs = wrapper.findAllComponents({ name: "AlertDialogRoot" })
    const openDialog = alertDialogs.find((d) => d.props("open") === true)
    expect(openDialog).toBeDefined()
  })

  describe("recovery code", () => {
    const identityId = "test-uuid-1234-5678-abcd-ef1234567890"
    const codeResult = {
      recovery_link: "https://app.example.test/recovery?flow=f-1",
      recovery_code: "482913",
    }

    async function clickButton(wrapper: ReturnType<typeof renderDetail>["wrapper"], label: string) {
      const btn = wrapper.findAll("button").find((b) => b.text().includes(label))!
      await btn.trigger("click")
      await flushPromises()
    }

    async function renderLoaded() {
      const result = renderDetail()
      await result.router.push(`/identities/${identityId}`)
      await result.router.isReady()
      await flushPromises()
      return result.wrapper
    }

    it("creates a recovery code valid for one hour", async () => {
      vi.mocked(identitiesApi.createRecoveryCode).mockResolvedValue(codeResult)
      const wrapper = await renderLoaded()

      await clickButton(wrapper, "Recovery Code")

      expect(vi.mocked(identitiesApi.createRecoveryCode)).toHaveBeenCalledWith(identityId, "1h")
    })

    it("shows the recovery link and code after creation", async () => {
      vi.mocked(identitiesApi.createRecoveryCode).mockResolvedValue(codeResult)
      const wrapper = await renderLoaded()

      await clickButton(wrapper, "Recovery Code")

      const text = wrapper.text()
      expect(text).toContain("Recovery Code Generated")
      expect(text).toContain("https://app.example.test/recovery?flow=f-1")
      expect(text).toContain("482913")
      expect(text).toContain("The code works once and expires in 1 hour.")
    })

    it("shows only the latest recovery result", async () => {
      vi.mocked(identitiesApi.createRecoveryCode).mockResolvedValue(codeResult)
      vi.mocked(identitiesApi.createRecoveryLink).mockResolvedValue({
        recovery_link: "https://app.example.test/link",
      })
      const wrapper = await renderLoaded()

      await clickButton(wrapper, "Recovery Code")
      await clickButton(wrapper, "Recovery Link")
      expect(wrapper.text()).not.toContain("482913")
      expect(wrapper.text()).not.toContain("Recovery Code Generated")
      expect(wrapper.text()).toContain("Recovery Link Generated")

      await clickButton(wrapper, "Recovery Code")
      expect(wrapper.text()).toContain("482913")
      expect(wrapper.text()).not.toContain("Recovery Link Generated")
      expect(wrapper.text()).not.toContain("https://app.example.test/link")
    })
  })
})
