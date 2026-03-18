import { describe, it, expect, vi, beforeEach } from "vitest"
import { ref } from "vue"

vi.mock("@tanstack/vue-query", () => ({
  useQuery: vi.fn(() => ({ data: ref(null), isLoading: ref(false), error: ref(null) })),
}))

vi.mock("@/api/oathkeeper", () => ({
  oathkeeperApi: {
    listRules: vi.fn(),
    getRule: vi.fn(),
    getHealth: vi.fn(),
    getReady: vi.fn(),
    getVersion: vi.fn(),
    getJWKS: vi.fn(),
  },
}))

import {
  useRules,
  useRule,
  useOathkeeperHealth,
  useOathkeeperReady,
  useOathkeeperVersion,
  useJWKS,
} from "../useOathkeeper"

describe("useOathkeeper composables", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("useRules returns query result", () => {
    expect(useRules()).toBeDefined()
  })

  it("useRules accepts params ref", () => {
    expect(useRules(ref({ limit: 10, offset: 0 }))).toBeDefined()
  })

  it("useRule returns query result for given id", () => {
    expect(useRule(ref("rule-1"))).toBeDefined()
  })

  it("useOathkeeperHealth returns query result", () => {
    expect(useOathkeeperHealth()).toBeDefined()
  })

  it("useOathkeeperHealth accepts enabled option", () => {
    expect(useOathkeeperHealth({ enabled: ref(true) })).toBeDefined()
  })

  it("useOathkeeperReady returns query result", () => {
    expect(useOathkeeperReady()).toBeDefined()
  })

  it("useOathkeeperVersion returns query result", () => {
    expect(useOathkeeperVersion()).toBeDefined()
  })

  it("useJWKS returns query result", () => {
    expect(useJWKS()).toBeDefined()
  })
})
