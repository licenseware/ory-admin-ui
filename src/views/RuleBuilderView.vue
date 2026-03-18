<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"
import yaml from "js-yaml"
import { useRule } from "@/composables/useOathkeeper"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Label from "@/components/ui/Label.vue"
import Badge from "@/components/ui/Badge.vue"
import Select from "@/components/ui/Select.vue"
import Textarea from "@/components/ui/Textarea.vue"
import CopyButton from "@/components/common/CopyButton.vue"
import BackButton from "@/components/common/BackButton.vue"
import { Shield, Plus, Trash2, Download } from "lucide-vue-next"
import { cn } from "@/lib/utils"

const route = useRoute()

// --- Clone support ---
const cloneId = computed(() => (route.query.clone as string) || "")
const isClone = computed(() => !!cloneId.value)
const { data: cloneRule } = useRule(cloneId)

// --- Form state ---
const ruleId = ref("")
const description = ref("")
const matchUrl = ref("")
const matchMethods = ref<string[]>(["GET"])
const upstreamUrl = ref("")
const upstreamPreserveHost = ref(false)
const upstreamStripPath = ref("")
const authenticators = ref<Array<{ handler: string; config: string }>>([
  { handler: "anonymous", config: "" },
])
const authorizer = ref({ handler: "allow", config: "" })
const mutators = ref<Array<{ handler: string; config: string }>>([{ handler: "noop", config: "" }])

// --- Handler options ---
const allMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]

const authenticatorOptions = [
  { value: "anonymous", label: "anonymous" },
  { value: "cookie_session", label: "cookie_session" },
  { value: "oauth2_client_credentials", label: "oauth2_client_credentials" },
  { value: "oauth2_introspection", label: "oauth2_introspection" },
  { value: "jwt", label: "jwt" },
  { value: "noop", label: "noop" },
  { value: "unauthorized", label: "unauthorized" },
]

const authorizerOptions = [
  { value: "allow", label: "allow" },
  { value: "deny", label: "deny" },
  { value: "keto_engine_acp_ory", label: "keto_engine_acp_ory" },
  { value: "remote", label: "remote" },
  { value: "remote_json", label: "remote_json" },
]

const mutatorOptions = [
  { value: "noop", label: "noop" },
  { value: "id_token", label: "id_token" },
  { value: "header", label: "header" },
  { value: "cookie", label: "cookie" },
  { value: "hydrator", label: "hydrator" },
]

// --- Clone pre-fill ---
watch(cloneRule, (rule) => {
  if (!rule) return
  ruleId.value = (rule.id || "") + "-copy"
  description.value = rule.description || ""
  matchUrl.value = rule.match?.url || ""
  matchMethods.value = rule.match?.methods?.length ? [...rule.match.methods] : ["GET"]
  upstreamUrl.value = rule.upstream?.url || ""
  upstreamPreserveHost.value = rule.upstream?.preserve_host ?? false
  upstreamStripPath.value = rule.upstream?.strip_path || ""

  if (rule.authenticators?.length) {
    authenticators.value = rule.authenticators.map((a) => ({
      handler: a.handler || "anonymous",
      config: a.config !== undefined && a.config !== null ? JSON.stringify(a.config, null, 2) : "",
    }))
  }

  if (rule.authorizer) {
    authorizer.value = {
      handler: rule.authorizer.handler || "allow",
      config:
        rule.authorizer.config !== undefined && rule.authorizer.config !== null
          ? JSON.stringify(rule.authorizer.config, null, 2)
          : "",
    }
  }

  if (rule.mutators?.length) {
    mutators.value = rule.mutators.map((m) => ({
      handler: m.handler || "noop",
      config: m.config !== undefined && m.config !== null ? JSON.stringify(m.config, null, 2) : "",
    }))
  }
})

// --- Dynamic list helpers ---
function addAuthenticator() {
  authenticators.value.push({ handler: "anonymous", config: "" })
}

function removeAuthenticator(index: number) {
  authenticators.value.splice(index, 1)
}

function addMutator() {
  mutators.value.push({ handler: "noop", config: "" })
}

function removeMutator(index: number) {
  mutators.value.splice(index, 1)
}

function toggleMethod(method: string) {
  const idx = matchMethods.value.indexOf(method)
  if (idx >= 0) {
    matchMethods.value.splice(idx, 1)
  } else {
    matchMethods.value.push(method)
  }
}

// --- YAML generation ---
function parseJsonSafe(str: string): unknown {
  if (!str.trim()) return undefined
  try {
    return JSON.parse(str)
  } catch {
    return undefined
  }
}

function isValidJson(str: string): boolean {
  if (!str.trim()) return true
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

const generatedYaml = computed(() => {
  const rule: Record<string, unknown> = {
    id: ruleId.value || "my-rule",
    ...(description.value ? { description: description.value } : {}),
    match: {
      url: matchUrl.value || "http://localhost:4455/<.*>",
      methods: matchMethods.value.length ? matchMethods.value : ["GET"],
    },
    upstream: {
      url: upstreamUrl.value || "http://localhost:4000",
      ...(upstreamPreserveHost.value ? { preserve_host: true } : {}),
      ...(upstreamStripPath.value ? { strip_path: upstreamStripPath.value } : {}),
    },
    authenticators: authenticators.value.map((a) => ({
      handler: a.handler,
      ...(parseJsonSafe(a.config) !== undefined ? { config: parseJsonSafe(a.config) } : {}),
    })),
    authorizer: {
      handler: authorizer.value.handler,
      ...(parseJsonSafe(authorizer.value.config) !== undefined
        ? { config: parseJsonSafe(authorizer.value.config) }
        : {}),
    },
    mutators: mutators.value.map((m) => ({
      handler: m.handler,
      ...(parseJsonSafe(m.config) !== undefined ? { config: parseJsonSafe(m.config) } : {}),
    })),
  }
  return yaml.dump([rule], { lineWidth: -1 })
})

// --- Download ---
function downloadYaml() {
  const blob = new Blob([generatedYaml.value], { type: "application/x-yaml" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${ruleId.value || "rule"}.yml`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <!-- Back button -->
    <BackButton fallback="/rules" label="Back to Rules" />

    <!-- Header -->
    <div>
      <h1 class="text-text-primary text-2xl font-semibold">
        {{ isClone ? "Clone Rule" : "New Rule" }}
      </h1>
      <p class="text-text-muted mt-1 text-sm">
        {{
          isClone
            ? "Clone an existing rule and generate a YAML configuration"
            : "Build a new Oathkeeper rule and generate a YAML configuration"
        }}
      </p>
    </div>

    <!-- General Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Shield class="h-4 w-4" />
          General
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="rule-id">Rule ID</Label>
          <Input id="rule-id" v-model="ruleId" placeholder="my-rule" />
        </div>
        <div class="space-y-2">
          <Label for="rule-description">Description</Label>
          <Input id="rule-description" v-model="description" placeholder="Optional description" />
        </div>
      </CardContent>
    </Card>

    <!-- Match Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Shield class="h-4 w-4" />
          Match
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="match-url">URL Pattern</Label>
          <Input
            id="match-url"
            v-model="matchUrl"
            placeholder="http://localhost:4455/<.*>"
            class="font-mono text-sm"
          />
        </div>
        <div class="space-y-2">
          <Label>HTTP Methods</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="method in allMethods"
              :key="method"
              type="button"
              :class="[
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                matchMethods.includes(method)
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hover:border-border-default border-border-subtle text-text-secondary',
              ]"
              @click="toggleMethod(method)"
            >
              {{ method }}
            </button>
          </div>
          <div v-if="matchMethods.length" class="flex flex-wrap gap-1 pt-1">
            <Badge v-for="method in matchMethods" :key="method" variant="secondary">
              {{ method }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upstream Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Shield class="h-4 w-4" />
          Upstream
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="upstream-url">URL</Label>
          <Input
            id="upstream-url"
            v-model="upstreamUrl"
            placeholder="http://localhost:4000"
            class="font-mono text-sm"
          />
        </div>
        <div class="flex items-center gap-3">
          <input
            id="preserve-host"
            v-model="upstreamPreserveHost"
            type="checkbox"
            class="border-border accent-accent h-4 w-4 rounded"
          />
          <Label for="preserve-host" class="cursor-pointer">Preserve Host</Label>
        </div>
        <div class="space-y-2">
          <Label for="strip-path">Strip Path</Label>
          <Input
            id="strip-path"
            v-model="upstreamStripPath"
            placeholder="/api"
            class="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Authenticators Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2 text-base">
            <Shield class="h-4 w-4" />
            Authenticators
          </CardTitle>
          <Button variant="outline" size="sm" @click="addAuthenticator">
            <Plus class="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="(auth, index) in authenticators"
          :key="index"
          class="border-border-subtle space-y-3 rounded-lg border p-3"
        >
          <div class="flex items-center justify-between">
            <Label>Handler</Label>
            <Button
              v-if="authenticators.length > 1"
              variant="ghost"
              size="icon"
              class="text-destructive hover:text-destructive h-7 w-7"
              aria-label="Remove authenticator"
              @click="removeAuthenticator(index)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
          <Select
            v-model="auth.handler"
            :options="authenticatorOptions"
            placeholder="Select handler"
          />
          <div class="space-y-2">
            <Label>Config (JSON)</Label>
            <Textarea
              v-model="auth.config"
              :rows="3"
              :class="cn('font-mono text-sm', !isValidJson(auth.config) && 'border-destructive')"
              placeholder="{}"
            />
            <p v-if="!isValidJson(auth.config)" class="text-destructive text-xs">Invalid JSON</p>
          </div>
        </div>
        <p v-if="!authenticators.length" class="text-text-muted text-sm">
          No authenticators configured. Click "Add" to add one.
        </p>
      </CardContent>
    </Card>

    <!-- Authorizer Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Shield class="h-4 w-4" />
          Authorizer
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Handler</Label>
          <Select
            v-model="authorizer.handler"
            :options="authorizerOptions"
            placeholder="Select handler"
          />
        </div>
        <div class="space-y-2">
          <Label>Config (JSON)</Label>
          <Textarea
            v-model="authorizer.config"
            :rows="3"
            :class="
              cn('font-mono text-sm', !isValidJson(authorizer.config) && 'border-destructive')
            "
            placeholder="{}"
          />
          <p v-if="!isValidJson(authorizer.config)" class="text-destructive text-xs">
            Invalid JSON
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Mutators Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2 text-base">
            <Shield class="h-4 w-4" />
            Mutators
          </CardTitle>
          <Button variant="outline" size="sm" @click="addMutator">
            <Plus class="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="(mut, index) in mutators"
          :key="index"
          class="border-border-subtle space-y-3 rounded-lg border p-3"
        >
          <div class="flex items-center justify-between">
            <Label>Handler</Label>
            <Button
              v-if="mutators.length > 1"
              variant="ghost"
              size="icon"
              class="text-destructive hover:text-destructive h-7 w-7"
              aria-label="Remove mutator"
              @click="removeMutator(index)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
          <Select v-model="mut.handler" :options="mutatorOptions" placeholder="Select handler" />
          <div class="space-y-2">
            <Label>Config (JSON)</Label>
            <Textarea
              v-model="mut.config"
              :rows="3"
              :class="cn('font-mono text-sm', !isValidJson(mut.config) && 'border-destructive')"
              placeholder="{}"
            />
            <p v-if="!isValidJson(mut.config)" class="text-destructive text-xs">Invalid JSON</p>
          </div>
        </div>
        <p v-if="!mutators.length" class="text-text-muted text-sm">
          No mutators configured. Click "Add" to add one.
        </p>
      </CardContent>
    </Card>

    <!-- Generated YAML Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-base">Generated YAML</CardTitle>
          <div class="flex gap-1">
            <CopyButton :text="generatedYaml" label="Copy YAML" />
            <Button variant="ghost" size="icon" title="Download YAML" @click="downloadYaml">
              <Download class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre
          class="bg-surface-overlay text-text-primary overflow-x-auto rounded-lg p-4 font-mono text-sm"
          >{{ generatedYaml }}</pre
        >
      </CardContent>
    </Card>
  </div>
</template>
