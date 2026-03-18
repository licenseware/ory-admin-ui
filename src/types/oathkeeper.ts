import { z } from "zod"

// --- Handler (authenticator, authorizer, mutator) ---

export const ruleHandlerSchema = z.object({
  handler: z.string().optional(),
  config: z.unknown().optional(),
})

// --- Match ---

export const ruleMatchSchema = z.object({
  methods: z.array(z.string()).optional(),
  url: z.string().optional(),
})

// --- Upstream ---

export const upstreamSchema = z.object({
  preserve_host: z.boolean().optional(),
  strip_path: z.string().optional(),
  url: z.string().optional(),
})

// --- Rule ---

export const ruleSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
  match: ruleMatchSchema.optional(),
  authenticators: z.array(ruleHandlerSchema).optional(),
  authorizer: ruleHandlerSchema.optional(),
  mutators: z.array(ruleHandlerSchema).optional(),
  upstream: upstreamSchema.optional(),
})

// --- JWKS ---

export const jsonWebKeySchema = z.object({
  alg: z.string().optional(),
  crv: z.string().optional(),
  d: z.string().optional(),
  dp: z.string().optional(),
  dq: z.string().optional(),
  e: z.string().optional(),
  k: z.string().optional(),
  kid: z.string().optional(),
  kty: z.string().optional(),
  n: z.string().optional(),
  p: z.string().optional(),
  q: z.string().optional(),
  qi: z.string().optional(),
  use: z.string().optional(),
  x: z.string().optional(),
  x5c: z.array(z.string()).optional(),
  y: z.string().optional(),
})

export const jsonWebKeySetSchema = z.object({
  keys: z.array(jsonWebKeySchema).optional(),
})

// --- Health ---

export const oathkeeperHealthStatusSchema = z.object({
  status: z.string(),
})

export const oathkeeperHealthNotReadySchema = z.object({
  errors: z.record(z.string(), z.string()),
})

// --- Version ---

export const oathkeeperVersionSchema = z.object({
  version: z.string(),
})

// --- Inferred types ---

export type RuleHandler = z.infer<typeof ruleHandlerSchema>
export type RuleMatch = z.infer<typeof ruleMatchSchema>
export type Upstream = z.infer<typeof upstreamSchema>
export type Rule = z.infer<typeof ruleSchema>
export type JsonWebKey = z.infer<typeof jsonWebKeySchema>
export type JsonWebKeySet = z.infer<typeof jsonWebKeySetSchema>
export type OathkeeperHealthStatus = z.infer<typeof oathkeeperHealthStatusSchema>
export type OathkeeperVersion = z.infer<typeof oathkeeperVersionSchema>
