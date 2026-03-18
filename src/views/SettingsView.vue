<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useProfileStore, nameToSlug } from "@/stores/profile"
import { useThemeStore } from "@/stores/theme"
import { useHealthAlive, usePublicHealthAlive, useVersion } from "@/composables/useHealth"
import { useOathkeeperHealth, useOathkeeperVersion } from "@/composables/useOathkeeper"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardDescription from "@/components/ui/CardDescription.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Label from "@/components/ui/Label.vue"
import Badge from "@/components/ui/Badge.vue"
import {
  Settings,
  Server,
  Palette,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Copy,
} from "lucide-vue-next"
import { toast } from "vue-sonner"

const appVersion = __APP_VERSION__
const profileStore = useProfileStore()
const themeStore = useThemeStore()

const { isError: adminHealthError, refetch: checkAdminHealth } = useHealthAlive()
const { isError: publicHealthError, refetch: checkPublicHealth } = usePublicHealthAlive()
const { data: version } = useVersion()
const { isError: oathkeeperHealthError, refetch: checkOathkeeperHealth } = useOathkeeperHealth()
const { data: oathkeeperVersion } = useOathkeeperVersion()

// --- Active Profile Config form state ---
const adminUrl = ref(profileStore.kratosAdminBaseURL)
const publicUrl = ref(profileStore.kratosPublicBaseURL)
const oathkeeperUrl = ref(profileStore.oathkeeperApiBaseURL)

watch(
  () => profileStore.activeSlug,
  () => {
    adminUrl.value = profileStore.kratosAdminBaseURL
    publicUrl.value = profileStore.kratosPublicBaseURL
    oathkeeperUrl.value = profileStore.oathkeeperApiBaseURL
    adminTestResult.value = null
    publicTestResult.value = null
    oathkeeperTestResult.value = null
  }
)

// Per-field test state
const isTestingAdmin = ref(false)
const adminTestResult = ref<"success" | "error" | null>(null)
const isTestingPublic = ref(false)
const publicTestResult = ref<"success" | "error" | null>(null)
const isTestingOathkeeper = ref(false)
const oathkeeperTestResult = ref<"success" | "error" | null>(null)

watch(adminUrl, () => {
  adminTestResult.value = null
})
watch(publicUrl, () => {
  publicTestResult.value = null
})
watch(oathkeeperUrl, () => {
  oathkeeperTestResult.value = null
})

const isActiveConfigProfile = computed(
  () => profileStore.getProfileSource(profileStore.activeSlug) === "config"
)

const hasConfigChanges = computed(() => {
  return (
    adminUrl.value !== profileStore.kratosAdminBaseURL ||
    publicUrl.value !== profileStore.kratosPublicBaseURL ||
    oathkeeperUrl.value !== profileStore.oathkeeperApiBaseURL
  )
})

const isValidAdminUrl = computed(() => {
  try {
    new URL(adminUrl.value)
    return true
  } catch {
    return false
  }
})

const isValidPublicUrl = computed(() => {
  try {
    new URL(publicUrl.value)
    return true
  } catch {
    return false
  }
})

const isValidOathkeeperUrl = computed(() => {
  if (!oathkeeperUrl.value) return true
  try {
    new URL(oathkeeperUrl.value)
    return true
  } catch {
    return false
  }
})

function saveActiveProfile() {
  profileStore.updateProfile(profileStore.activeSlug, {
    kratosAdminBaseURL: adminUrl.value.replace(/\/+$/, ""),
    kratosPublicBaseURL: publicUrl.value.replace(/\/+$/, ""),
    oathkeeperApiBaseURL: oathkeeperUrl.value ? oathkeeperUrl.value.replace(/\/+$/, "") : undefined,
  })
  toast.success("Profile saved")
  checkAdminHealth()
  checkPublicHealth()
  checkOathkeeperHealth()
}

function resetActiveProfile() {
  adminUrl.value = profileStore.kratosAdminBaseURL
  publicUrl.value = profileStore.kratosPublicBaseURL
  oathkeeperUrl.value = profileStore.oathkeeperApiBaseURL
  adminTestResult.value = null
  publicTestResult.value = null
  oathkeeperTestResult.value = null
}

function overrideLocally() {
  profileStore.overrideConfigProfile(profileStore.activeSlug)
  toast.success("Profile can now be edited locally")
}

async function testAdminConnection() {
  if (!isValidAdminUrl.value) {
    toast.error("Please enter a valid Admin API URL")
    return
  }
  isTestingAdmin.value = true
  profileStore.updateProfile(profileStore.activeSlug, {
    kratosAdminBaseURL: adminUrl.value.replace(/\/+$/, ""),
  })
  await new Promise((resolve) => setTimeout(resolve, 500))
  await checkAdminHealth()
  isTestingAdmin.value = false
  adminTestResult.value = adminHealthError.value ? "error" : "success"
}

async function testPublicConnection() {
  if (!isValidPublicUrl.value) {
    toast.error("Please enter a valid Public API URL")
    return
  }
  isTestingPublic.value = true
  profileStore.updateProfile(profileStore.activeSlug, {
    kratosPublicBaseURL: publicUrl.value.replace(/\/+$/, ""),
  })
  await new Promise((resolve) => setTimeout(resolve, 500))
  await checkPublicHealth()
  isTestingPublic.value = false
  publicTestResult.value = publicHealthError.value ? "error" : "success"
}

async function testOathkeeperConnection() {
  if (!oathkeeperUrl.value) {
    toast.info("Oathkeeper URL is not configured")
    return
  }
  if (!isValidOathkeeperUrl.value) {
    toast.error("Please enter a valid Oathkeeper API URL")
    return
  }
  isTestingOathkeeper.value = true
  profileStore.updateProfile(profileStore.activeSlug, {
    oathkeeperApiBaseURL: oathkeeperUrl.value.replace(/\/+$/, ""),
  })
  await new Promise((resolve) => setTimeout(resolve, 500))
  await checkOathkeeperHealth()
  isTestingOathkeeper.value = false
  oathkeeperTestResult.value = oathkeeperHealthError.value ? "error" : "success"
}

// --- New Profile form ---
const showNewProfileForm = ref(false)
const newProfileName = ref("")
const newAdminUrl = ref("http://localhost:4455")
const newPublicUrl = ref("http://localhost:4433")
const newOathkeeperUrl = ref("http://localhost:4456")

const newProfileSlug = computed(() => nameToSlug(newProfileName.value))

function createNewProfile() {
  try {
    profileStore.createProfile(newProfileName.value, {
      kratosAdminBaseURL: newAdminUrl.value,
      kratosPublicBaseURL: newPublicUrl.value,
      oathkeeperApiBaseURL: newOathkeeperUrl.value,
    })
    toast.success(`Profile "${newProfileName.value}" created`)
    showNewProfileForm.value = false
    newProfileName.value = ""
    newAdminUrl.value = "http://localhost:4455"
    newPublicUrl.value = "http://localhost:4433"
    newOathkeeperUrl.value = "http://localhost:4456"
  } catch (e) {
    toast.error((e as Error).message)
  }
}

// --- Import / Export ---
function exportProfiles() {
  const data = profileStore.exportProfiles()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ory-profiles.json"
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Profiles exported")
}

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

async function handleImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const { imported, skipped } = profileStore.importProfiles(text)
    if (skipped.length) {
      toast.info(
        `Imported ${imported}, skipped ${skipped.length} (already exist: ${skipped.join(", ")})`
      )
    } else {
      toast.success(`Imported ${imported} profile(s)`)
    }
  } catch {
    toast.error("Invalid profile export file")
  }
  // Reset file input
  if (fileInput.value) fileInput.value.value = ""
}

// --- Theme (self-contained) ---
const theme = ref(themeStore.theme)

watch(theme, (newTheme) => {
  themeStore.setTheme(newTheme as "light" | "dark" | "system")
})
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-text-primary text-2xl font-semibold">Settings</h1>
      <p class="text-text-muted mt-1 text-sm">Manage profiles and configure the Ory Admin UI</p>
    </div>

    <!-- Card 1: Profile Management -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2 text-base">
              <Server class="h-4 w-4" />
              Profiles
            </CardTitle>
            <CardDescription>Manage your Ory Kratos profiles</CardDescription>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="exportProfiles">
              <Download class="mr-1 h-3 w-3" />
              Export
            </Button>
            <Button variant="outline" size="sm" @click="triggerImport">
              <Upload class="mr-1 h-3 w-3" />
              Import
            </Button>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImportFile"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <!-- Profile list -->
        <div class="space-y-1">
          <button
            v-for="profile in profileStore.allProfiles"
            :key="profile.slug"
            class="border-border-subtle hover:bg-surface-raised flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors"
            :class="profile.slug === profileStore.activeSlug ? 'border-accent/30 bg-accent/5' : ''"
            @click="profileStore.switchProfile(profile.slug)"
          >
            <div class="flex items-center gap-2">
              <Check
                :class="[
                  'h-4 w-4',
                  profile.slug === profileStore.activeSlug ? 'text-accent' : 'text-transparent',
                ]"
              />
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-text-primary text-sm font-medium">{{ profile.name }}</span>
                  <Badge
                    :variant="
                      profileStore.getProfileSource(profile.slug) === 'config'
                        ? 'secondary'
                        : 'outline'
                    "
                    class="px-1 py-0 text-[10px]"
                  >
                    {{ profileStore.getProfileSource(profile.slug) }}
                  </Badge>
                </div>
                <p class="text-text-muted text-xs">{{ profile.slug }}</p>
              </div>
            </div>
            <div class="flex gap-1">
              <Button
                v-if="profileStore.getProfileSource(profile.slug) === 'config'"
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                @click.stop="overrideLocally"
              >
                <Copy class="h-3.5 w-3.5" />
              </Button>
              <Button
                v-if="
                  profileStore.getProfileSource(profile.slug) === 'local' &&
                  profile.slug !== profileStore.activeSlug
                "
                variant="ghost"
                size="icon"
                class="text-destructive hover:text-destructive h-7 w-7"
                @click.stop="profileStore.deleteProfile(profile.slug)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>
          </button>
        </div>

        <!-- New Profile form -->
        <div v-if="showNewProfileForm" class="border-border-subtle space-y-3 rounded-lg border p-3">
          <div class="space-y-2">
            <Label for="new-profile-name">Profile Name</Label>
            <Input
              id="new-profile-name"
              v-model="newProfileName"
              placeholder="e.g. Production EU"
            />
            <p v-if="newProfileName" class="text-text-muted text-xs">
              Slug: <code class="bg-surface-raised rounded px-1">{{ newProfileSlug }}</code>
            </p>
          </div>
          <div class="space-y-2">
            <Label for="new-admin-url">Admin API URL</Label>
            <Input id="new-admin-url" v-model="newAdminUrl" type="url" />
          </div>
          <div class="space-y-2">
            <Label for="new-public-url">Public API URL</Label>
            <Input id="new-public-url" v-model="newPublicUrl" type="url" />
          </div>
          <div class="space-y-2">
            <Label for="new-oathkeeper-url">Oathkeeper API URL</Label>
            <Input id="new-oathkeeper-url" v-model="newOathkeeperUrl" type="url" />
          </div>
          <div class="flex gap-2">
            <Button size="sm" @click="createNewProfile" :disabled="!newProfileName">
              Create
            </Button>
            <Button variant="outline" size="sm" @click="showNewProfileForm = false">
              Cancel
            </Button>
          </div>
        </div>

        <Button
          v-else
          variant="outline"
          size="sm"
          class="w-full"
          @click="showNewProfileForm = true"
        >
          <Plus class="mr-1 h-3 w-3" />
          New Profile
        </Button>
      </CardContent>
    </Card>

    <!-- Card 2: Active Profile Configuration -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Server class="h-4 w-4" />
          Active Profile
          <Badge variant="outline" class="ml-1">
            {{ profileStore.activeProfile?.name || profileStore.activeSlug }}
          </Badge>
          <Badge
            :variant="isActiveConfigProfile ? 'secondary' : 'outline'"
            class="px-1 py-0 text-[10px]"
          >
            {{ profileStore.getProfileSource(profileStore.activeSlug) }}
          </Badge>
        </CardTitle>
        <CardDescription>Configure endpoints for the active profile</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-if="isActiveConfigProfile"
          class="border-warning/30 bg-warning/5 rounded-lg border p-3"
        >
          <p class="text-warning text-xs">
            This profile is loaded from config.json and cannot be edited directly.
          </p>
          <Button variant="outline" size="sm" class="mt-2" @click="overrideLocally">
            Override Locally
          </Button>
        </div>

        <div class="space-y-2">
          <Label for="admin-endpoint">Kratos Admin API Endpoint</Label>
          <div class="flex items-center gap-2">
            <Input
              id="admin-endpoint"
              v-model="adminUrl"
              type="url"
              :disabled="isActiveConfigProfile"
              :class="!isValidAdminUrl && adminUrl ? 'border-destructive' : ''"
            />
            <Button
              variant="outline"
              @click="testAdminConnection"
              :disabled="!isValidAdminUrl || isTestingAdmin"
            >
              <Loader2 v-if="isTestingAdmin" class="mr-1 h-3 w-3 animate-spin" />
              Test
            </Button>
            <CheckCircle
              v-if="adminTestResult === 'success'"
              class="text-success h-4 w-4 flex-shrink-0"
            />
            <XCircle
              v-else-if="adminTestResult === 'error'"
              class="text-destructive h-4 w-4 flex-shrink-0"
            />
          </div>
          <p v-if="!isValidAdminUrl && adminUrl" class="text-destructive text-xs">
            Please enter a valid URL
          </p>
          <p class="text-text-muted text-xs">
            The URL of your Kratos Admin API. This is typically port 4434.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="public-endpoint">Kratos Public API Endpoint</Label>
          <div class="flex items-center gap-2">
            <Input
              id="public-endpoint"
              v-model="publicUrl"
              type="url"
              :disabled="isActiveConfigProfile"
              :class="!isValidPublicUrl && publicUrl ? 'border-destructive' : ''"
            />
            <Button
              variant="outline"
              @click="testPublicConnection"
              :disabled="!isValidPublicUrl || isTestingPublic"
            >
              <Loader2 v-if="isTestingPublic" class="mr-1 h-3 w-3 animate-spin" />
              Test
            </Button>
            <CheckCircle
              v-if="publicTestResult === 'success'"
              class="text-success h-4 w-4 flex-shrink-0"
            />
            <XCircle
              v-else-if="publicTestResult === 'error'"
              class="text-destructive h-4 w-4 flex-shrink-0"
            />
          </div>
          <p v-if="!isValidPublicUrl && publicUrl" class="text-destructive text-xs">
            Please enter a valid URL
          </p>
          <p class="text-text-muted text-xs">
            The URL of your Kratos Public API. This is typically port 4433.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="oathkeeper-endpoint">Oathkeeper API Endpoint</Label>
          <div class="flex items-center gap-2">
            <Input
              id="oathkeeper-endpoint"
              v-model="oathkeeperUrl"
              type="url"
              :disabled="isActiveConfigProfile"
              :class="!isValidOathkeeperUrl && oathkeeperUrl ? 'border-destructive' : ''"
            />
            <Button
              variant="outline"
              @click="testOathkeeperConnection"
              :disabled="!isValidOathkeeperUrl || isTestingOathkeeper"
            >
              <Loader2 v-if="isTestingOathkeeper" class="mr-1 h-3 w-3 animate-spin" />
              Test
            </Button>
            <CheckCircle
              v-if="oathkeeperTestResult === 'success'"
              class="text-success h-4 w-4 flex-shrink-0"
            />
            <XCircle
              v-else-if="oathkeeperTestResult === 'error'"
              class="text-destructive h-4 w-4 flex-shrink-0"
            />
          </div>
          <p v-if="!isValidOathkeeperUrl && oathkeeperUrl" class="text-destructive text-xs">
            Please enter a valid URL
          </p>
          <p class="text-text-muted text-xs">
            The URL of your Oathkeeper API. Leave empty if not using Oathkeeper. Typically port
            4456.
          </p>
        </div>

        <div v-if="!isActiveConfigProfile" class="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="resetActiveProfile"
            :disabled="!hasConfigChanges"
          >
            <RotateCcw class="mr-1 h-3 w-3" />
            Reset
          </Button>
          <Button size="sm" @click="saveActiveProfile" :disabled="!hasConfigChanges">
            <Save class="mr-1 h-3 w-3" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Card 3: Appearance -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Palette class="h-4 w-4" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel of the admin UI</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Theme</Label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="theme = 'light'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'light'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Sun class="h-4 w-4" />
              <span class="text-sm">Light</span>
            </button>
            <button
              @click="theme = 'dark'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'dark'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Moon class="h-4 w-4" />
              <span class="text-sm">Dark</span>
            </button>
            <button
              @click="theme = 'system'"
              :class="[
                'flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors',
                theme === 'system'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
            >
              <Monitor class="h-4 w-4" />
              <span class="text-sm">System</span>
            </button>
          </div>
          <p class="text-text-muted text-xs">
            Choose your preferred color scheme or use system settings
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Card 4: About -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Settings class="h-4 w-4" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="border-border-subtle flex justify-between border-b py-2">
          <span class="text-text-muted text-sm">Admin UI Version</span>
          <a
            :href="`https://github.com/licenseware/ory-admin-ui/releases/tag/v${appVersion}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:text-accent-hover font-mono text-sm"
          >
            {{ appVersion }}
          </a>
        </div>
        <div class="border-border-subtle flex justify-between border-b py-2">
          <span class="text-text-muted text-sm">Kratos Version</span>
          <a
            v-if="version?.version"
            :href="`https://github.com/ory/kratos/releases/tag/${version.version}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:text-accent-hover font-mono text-sm"
          >
            {{ version.version }}
          </a>
          <span v-else class="text-text-primary font-mono text-sm">Unknown</span>
        </div>
        <div class="border-border-subtle flex justify-between border-b py-2">
          <span class="text-text-muted text-sm">Oathkeeper Version</span>
          <a
            v-if="oathkeeperVersion?.version"
            :href="`https://github.com/ory/oathkeeper/releases/tag/v${oathkeeperVersion.version}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:text-accent-hover font-mono text-sm"
          >
            {{ oathkeeperVersion.version }}
          </a>
          <span v-else class="text-text-primary font-mono text-sm">Unknown</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-text-muted text-sm">Documentation</span>
          <a
            href="https://www.ory.sh/docs/kratos"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:text-accent-hover text-sm"
          >
            Ory Kratos Docs
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
