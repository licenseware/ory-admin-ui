import { getOathkeeperApiClient } from "./client"
import { safeParseWithLog, safeParseArrayWithLog } from "@/lib/validation"
import {
  ruleSchema,
  jsonWebKeySetSchema,
  oathkeeperHealthStatusSchema,
  oathkeeperVersionSchema,
} from "@/types/oathkeeper"
import type {
  Rule,
  JsonWebKeySet,
  OathkeeperHealthStatus,
  OathkeeperVersion,
} from "@/types/oathkeeper"

export interface RuleListParams {
  limit?: number
  offset?: number
}

export const oathkeeperApi = {
  listRules: async (params?: RuleListParams): Promise<Rule[]> => {
    const client = getOathkeeperApiClient()
    const searchParams = new URLSearchParams()
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit))
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset))

    const raw = await client
      .get("rules", {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<Rule[]>()
    return safeParseArrayWithLog(ruleSchema, raw, "oathkeeperApi.listRules")
  },

  getRule: async (id: string): Promise<Rule> => {
    const client = getOathkeeperApiClient()
    const raw = await client.get(`rules/${encodeURIComponent(id)}`).json<Rule>()
    return safeParseWithLog(ruleSchema, raw, "oathkeeperApi.getRule")
  },

  getHealth: async (): Promise<OathkeeperHealthStatus> => {
    const client = getOathkeeperApiClient()
    const raw = await client.get("health/alive").json<OathkeeperHealthStatus>()
    return safeParseWithLog(oathkeeperHealthStatusSchema, raw, "oathkeeperApi.getHealth")
  },

  getReady: async (): Promise<OathkeeperHealthStatus> => {
    const client = getOathkeeperApiClient()
    const raw = await client.get("health/ready").json<OathkeeperHealthStatus>()
    return safeParseWithLog(oathkeeperHealthStatusSchema, raw, "oathkeeperApi.getReady")
  },

  getVersion: async (): Promise<OathkeeperVersion> => {
    const client = getOathkeeperApiClient()
    const raw = await client.get("version").json<OathkeeperVersion>()
    return safeParseWithLog(oathkeeperVersionSchema, raw, "oathkeeperApi.getVersion")
  },

  getJWKS: async (): Promise<JsonWebKeySet> => {
    const client = getOathkeeperApiClient()
    const raw = await client.get(".well-known/jwks.json").json<JsonWebKeySet>()
    return safeParseWithLog(jsonWebKeySetSchema, raw, "oathkeeperApi.getJWKS")
  },
}
