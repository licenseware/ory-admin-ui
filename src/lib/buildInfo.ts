const REPO = "licenseware/ory-admin-ui"

const rawVersion = __APP_VERSION__
const rawCommit = __APP_COMMIT__

export const isStableBuild = /^\d+\.\d+\.\d+$/.test(rawVersion)

export const commitSha = rawCommit
export const shortCommitSha = rawCommit.slice(0, 7)

export const appVersion = isStableBuild ? `v${rawVersion}` : "edge"

export const repoUrl = `https://github.com/${REPO}`

export const releaseUrl = `${repoUrl}/releases/tag/v${rawVersion}`

export const commitUrl = `${repoUrl}/commit/${rawCommit}`
