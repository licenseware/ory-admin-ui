<script setup lang="ts">
import { computed } from "vue"
import {
  Type,
  Hash,
  ToggleLeft,
  Braces,
  List,
  CircleDot,
  Mail,
  Key,
  RefreshCw,
  ShieldCheck,
  Info,
} from "lucide-vue-next"
import Badge from "@/components/ui/Badge.vue"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import { cn } from "@/lib/utils"

interface PropertySchema {
  type?: string | string[]
  format?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  enum?: unknown[]
  items?: PropertySchema
  properties?: Record<string, PropertySchema>
  required?: string[]
  title?: string
  description?: string
  default?: unknown
  "ory.sh/kratos"?: {
    credentials?: {
      password?: { identifier?: boolean }
      webauthn?: { identifier?: boolean }
      totp?: { account_name?: boolean }
    }
    verification?: { via?: string }
    recovery?: { via?: string }
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface Props {
  schema: PropertySchema | null
  path: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
})

defineEmits<{
  close: []
}>()

const pathParts = computed(() => props.path.split(".").filter(Boolean))

function getType(schema: PropertySchema): string {
  if (!schema) return "unknown"
  if (Array.isArray(schema.type)) return schema.type[0] || "any"
  return schema.type || "any"
}

const typeIcon = computed(() => {
  if (!props.schema) return CircleDot
  const type = getType(props.schema)
  switch (type) {
    case "string":
      return Type
    case "number":
    case "integer":
      return Hash
    case "boolean":
      return ToggleLeft
    case "object":
      return Braces
    case "array":
      return List
    default:
      return CircleDot
  }
})

const typeColor = computed(() => {
  if (!props.schema) return "text-text-muted"
  const type = getType(props.schema)
  switch (type) {
    case "string":
      return "text-success"
    case "number":
    case "integer":
      return "text-warning"
    case "boolean":
      return "text-syntax-boolean"
    case "object":
      return "text-accent"
    case "array":
      return "text-syntax-array"
    default:
      return "text-text-muted"
  }
})

const constraints = computed(() => {
  if (!props.schema) return []
  const result: { key: string; label: string; value: string }[] = []

  if (props.schema.format) {
    result.push({ key: "format", label: "Format", value: props.schema.format })
  }
  if (props.schema.minLength !== undefined) {
    result.push({ key: "minLength", label: "Min Length", value: String(props.schema.minLength) })
  }
  if (props.schema.maxLength !== undefined) {
    result.push({ key: "maxLength", label: "Max Length", value: String(props.schema.maxLength) })
  }
  if (props.schema.minimum !== undefined) {
    result.push({ key: "minimum", label: "Minimum", value: String(props.schema.minimum) })
  }
  if (props.schema.maximum !== undefined) {
    result.push({ key: "maximum", label: "Maximum", value: String(props.schema.maximum) })
  }
  if (props.schema.pattern) {
    result.push({ key: "pattern", label: "Pattern", value: props.schema.pattern })
  }
  if (props.schema.default !== undefined) {
    result.push({ key: "default", label: "Default", value: JSON.stringify(props.schema.default) })
  }

  return result
})

const enumValues = computed(() => {
  if (!props.schema?.enum) return []
  return props.schema.enum
})

const oryExtensions = computed(() => {
  if (!props.schema?.["ory.sh/kratos"]) return []
  const extensions: { icon: typeof Mail; title: string; description: string; color: string }[] = []
  const ory = props.schema["ory.sh/kratos"]

  if (ory.credentials?.password?.identifier) {
    extensions.push({
      icon: Key,
      title: "Login Identifier",
      description: "This field is used as the login identifier for password authentication",
      color: "border-accent bg-accent/5",
    })
  }

  if (ory.credentials?.webauthn?.identifier) {
    extensions.push({
      icon: ShieldCheck,
      title: "WebAuthn Identifier",
      description: "This field is used as the identifier for WebAuthn/passkey authentication",
      color: "border-purple-500 bg-purple-500/5",
    })
  }

  if (ory.credentials?.totp?.account_name) {
    extensions.push({
      icon: ShieldCheck,
      title: "TOTP Account Name",
      description: "This field is displayed as the account name in authenticator apps",
      color: "border-pink-500 bg-pink-500/5",
    })
  }

  if (ory.verification?.via) {
    extensions.push({
      icon: Mail,
      title: "Email Verification",
      description: `Account verification is sent via ${ory.verification.via}`,
      color: "border-success bg-success/5",
    })
  }

  if (ory.recovery?.via) {
    extensions.push({
      icon: RefreshCw,
      title: "Account Recovery",
      description: `Account recovery link is sent via ${ory.recovery.via}`,
      color: "border-warning bg-warning/5",
    })
  }

  return extensions
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Empty state -->
    <div v-if="!schema" class="text-text-muted flex flex-1 items-center justify-center">
      <div class="space-y-2 text-center">
        <Info class="mx-auto h-8 w-8 opacity-50" />
        <p class="text-sm">Select a property to view details</p>
      </div>
    </div>

    <template v-else>
      <!-- Header with path breadcrumb -->
      <div class="border-border-subtle bg-surface-overlay/50 border-b px-4 py-3">
        <div class="mb-2 flex items-center gap-2">
          <component :is="typeIcon" :class="cn('h-5 w-5', typeColor)" />
          <h3 class="text-text-primary font-semibold">
            {{ pathParts[pathParts.length - 1] || "Root" }}
          </h3>
          <Badge v-if="required" variant="warning" class="text-[10px]">required</Badge>
        </div>
        <nav class="text-text-muted flex flex-wrap items-center gap-1 text-xs">
          <template v-for="(part, i) in pathParts" :key="i">
            <span v-if="i > 0" class="text-text-muted/50">/</span>
            <span :class="i === pathParts.length - 1 ? 'text-text-secondary' : ''">{{ part }}</span>
          </template>
        </nav>
      </div>

      <!-- Content -->
      <div class="flex-1 space-y-4 overflow-y-auto p-4">
        <!-- Type & Basic Info -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Type Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-text-muted text-sm">Type</span>
              <Badge :class="typeColor" variant="outline">{{ getType(schema) }}</Badge>
            </div>
            <div v-if="schema.title" class="flex min-w-0 items-center justify-between gap-2">
              <span class="text-text-muted text-sm">Title</span>
              <span class="text-text-primary ml-2 truncate text-sm">{{ schema.title }}</span>
            </div>
            <div v-if="schema.description" class="border-border-subtle border-t pt-2">
              <p class="text-text-secondary text-sm">{{ schema.description }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Constraints -->
        <Card v-if="constraints.length">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div
                v-for="constraint in constraints"
                :key="constraint.key"
                class="flex items-center justify-between"
              >
                <span class="text-text-muted text-sm">{{ constraint.label }}</span>
                <code
                  class="bg-surface-overlay text-text-primary max-w-[50%] truncate rounded px-2 py-0.5 font-mono text-xs"
                >
                  {{ constraint.value }}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Enum Values -->
        <Card v-if="enumValues.length">
          <CardHeader class="pb-2">
            <CardTitle class="text-sm">Allowed Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="(value, i) in enumValues"
                :key="i"
                variant="secondary"
                class="font-mono text-xs"
              >
                {{ JSON.stringify(value) }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Ory Extensions -->
        <template v-if="oryExtensions.length">
          <div class="space-y-2">
            <h4 class="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span class="bg-accent flex h-4 w-4 items-center justify-center rounded-full">
                <span class="text-surface text-[8px] font-bold">ORY</span>
              </span>
              Ory Kratos Extensions
            </h4>
            <div
              v-for="ext in oryExtensions"
              :key="ext.title"
              :class="cn('rounded-lg border p-3', ext.color)"
            >
              <div class="flex items-start gap-3">
                <component :is="ext.icon" class="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div class="min-w-0">
                  <p class="text-text-primary text-sm font-medium">{{ ext.title }}</p>
                  <p class="text-text-secondary mt-0.5 text-xs">{{ ext.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Raw JSON -->
        <div>
          <h4 class="text-text-secondary mb-2 text-sm font-medium">Raw Schema</h4>
          <JsonViewer :data="schema" :initial-expanded="false" max-height="200px" />
        </div>
      </div>
    </template>
  </div>
</template>
