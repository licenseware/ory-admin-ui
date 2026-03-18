import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"

vi.mock("@tanstack/vue-query", () => ({
  useQuery: vi.fn(() => ({ data: ref(null), isLoading: ref(false), error: ref(null) })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: ref(false),
  })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}))

vi.mock("@/api/sessions", () => ({
  sessionsApi: {
    list: vi.fn(),
    get: vi.fn(),
    disable: vi.fn(),
    extend: vi.fn(),
  },
}))

import {
  useSessions,
  useSession,
  useDisableSession,
  useExtendSession,
  useRevokeSession,
} from "../useSessions"

describe("useSessions composables", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useSessions returns query result", () => {
    expect(useSessions()).toBeDefined()
  })

  it("useSessions accepts params ref", () => {
    expect(useSessions(ref({ pageSize: 20, active: true }))).toBeDefined()
  })

  it("useSession returns query result for given id", () => {
    expect(useSession(ref("session-1"))).toBeDefined()
  })

  it("useDisableSession returns mutation result", () => {
    const result = useDisableSession()
    expect(result.mutate).toBeDefined()
  })

  it("useExtendSession returns mutation result", () => {
    const result = useExtendSession()
    expect(result.mutate).toBeDefined()
  })

  it("useRevokeSession is aliased to useDisableSession", () => {
    expect(useRevokeSession).toBe(useDisableSession)
  })
})
