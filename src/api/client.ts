import ky from "ky"
import log from "loglevel"
import { useProfileStore } from "@/stores/profile"

log.setLevel(import.meta.env.DEV ? "debug" : "warn")

export function createApiClient() {
  const settings = useProfileStore()

  return ky.create({
    prefixUrl: settings.kratosAdminBaseURL,
    timeout: 30000,
    credentials: "include",
    redirect: "follow",
    hooks: {
      beforeRequest: [
        (request) => {
          log.debug(`[API] Request: ${request.method} ${request.url}`)
        },
      ],
      afterResponse: [
        (request, _options, response) => {
          log.debug(`[API] Response: ${request.method} ${request.url} - ${response.status}`)
          return response
        },
      ],
      beforeError: [
        (error) => {
          log.error(`[API] Error:`, error.message)
          return error
        },
      ],
    },
  })
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
  const settings = useProfileStore()

  return ky.create({
    prefixUrl: settings.kratosPublicBaseURL,
    timeout: 30000,
    credentials: "include",
    redirect: "follow",
    hooks: {
      beforeRequest: [
        (request) => {
          log.debug(`[Public API] Request: ${request.method} ${request.url}`)
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          log.debug(`[Public API] Response: ${response.status}`)
          return response
        },
      ],
      beforeError: [
        (error) => {
          log.error(`[Public API] Error:`, error.message)
          return error
        },
      ],
    },
  })
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
  const settings = useProfileStore()

  return ky.create({
    prefixUrl: settings.oathkeeperApiBaseURL,
    timeout: 30000,
    credentials: "include",
    redirect: "follow",
    hooks: {
      beforeRequest: [
        (request) => {
          log.debug(`[Oathkeeper API] Request: ${request.method} ${request.url}`)
        },
      ],
      afterResponse: [
        (_request, _options, response) => {
          log.debug(`[Oathkeeper API] Response: ${response.status}`)
          return response
        },
      ],
      beforeError: [
        (error) => {
          log.error(`[Oathkeeper API] Error:`, error.message)
          return error
        },
      ],
    },
  })
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
