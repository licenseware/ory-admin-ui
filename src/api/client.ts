import ky, { isHTTPError } from "ky"
import log from "loglevel"
import { useProfileStore } from "@/stores/profile"

log.setLevel(import.meta.env.DEV ? "debug" : "warn")

type ErrorBody = { error?: { reason?: string; message?: string } }

function createClient(prefix: string, label: string) {
  return ky.create({
    prefix,
    timeout: 30000,
    credentials: "include",
    redirect: "follow",
    hooks: {
      beforeRequest: [
        ({ request }) => {
          log.debug(`[${label}] Request: ${request.method} ${request.url}`)
        },
      ],
      afterResponse: [
        ({ request, response }) => {
          log.debug(`[${label}] Response: ${request.method} ${request.url} - ${response.status}`)
          return response
        },
      ],
      beforeError: [
        ({ error }) => {
          if (isHTTPError(error)) {
            const body = error.data as ErrorBody | string | undefined
            const detail =
              typeof body === "object" ? (body?.error?.reason ?? body?.error?.message) : undefined
            if (detail) {
              error.message = detail
            }
          }
          log.error(`[${label}] Error:`, error.message)
          return error
        },
      ],
    },
  })
}

export function createApiClient() {
  return createClient(useProfileStore().kratosAdminBaseURL, "API")
}

let apiClient: ReturnType<typeof createApiClient> | null = null

export function getApiClient() {
  if (!apiClient) {
    apiClient = createApiClient()
  }
  return apiClient
}

export function resetApiClient() {
  apiClient = null
}

export function createPublicApiClient() {
  return createClient(useProfileStore().kratosPublicBaseURL, "Public API")
}

let publicApiClient: ReturnType<typeof createPublicApiClient> | null = null

export function getPublicApiClient() {
  if (!publicApiClient) {
    publicApiClient = createPublicApiClient()
  }
  return publicApiClient
}

export function resetPublicApiClient() {
  publicApiClient = null
}

export function createOathkeeperApiClient() {
  return createClient(useProfileStore().oathkeeperApiBaseURL, "Oathkeeper API")
}

let oathkeeperApiClient: ReturnType<typeof createOathkeeperApiClient> | null = null

export function getOathkeeperApiClient() {
  if (!oathkeeperApiClient) {
    oathkeeperApiClient = createOathkeeperApiClient()
  }
  return oathkeeperApiClient
}

export function resetOathkeeperApiClient() {
  oathkeeperApiClient = null
}
