<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { useRule } from "@/composables/useOathkeeper"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import CopyButton from "@/components/common/CopyButton.vue"
import BackButton from "@/components/common/BackButton.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { Shield, Copy, Globe, Server, Lock, ChevronDown, ChevronRight } from "lucide-vue-next"
import type { RuleHandler } from "@/types/oathkeeper"

const route = useRoute()
const ruleId = computed(() => String(route.params.id))

const { data: rule, isLoading, isFetching, isError, error, refetch } = useRule(ruleId)

const rawJsonExpanded = ref(false)

function hasConfig(handler: RuleHandler): boolean {
  if (handler.config === undefined || handler.config === null) return false
  if (typeof handler.config === "object" && Object.keys(handler.config as object).length === 0)
    return false
  return true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <BackButton fallback="/rules" label="Back to Rules" />

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-24" />
      <Skeleton class="h-40" />
      <Skeleton class="h-40" />
      <Skeleton class="h-40" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="isError"
      :error="error"
      title="Failed to load rule"
      description="The rule could not be found or there was an error loading it."
      @retry="refetch"
    />

    <!-- Not found state -->
    <EmptyState
      v-else-if="!rule"
      title="Rule not found"
      description="The requested rule does not exist or has been removed."
    >
      <template #icon>
        <Shield class="h-8 w-8 text-text-muted" />
      </template>
    </EmptyState>

    <!-- Rule details -->
    <template v-else>
      <!-- Header card -->
      <Card>
        <CardContent class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 class="text-xl font-semibold text-text-primary">
                {{ rule.id }}
              </h1>
              <p v-if="rule.description" class="mt-1 text-sm text-text-muted">
                {{ rule.description }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <ReloadButton :is-fetching="isFetching" @reload="refetch" />
              <RouterLink :to="`/rules/new?clone=${ruleId}`">
                <Button variant="outline">
                  <Copy class="mr-2 h-4 w-4" />
                  Clone Rule
                </Button>
              </RouterLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Match card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Globe class="h-4 w-4" />
            Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="rule.match" class="space-y-3">
            <div
              v-if="rule.match.url"
              class="flex items-start justify-between border-b border-border-subtle py-2"
            >
              <span class="text-sm text-text-muted">URL Pattern</span>
              <code class="max-w-[60%] break-all text-right font-mono text-sm text-text-primary">
                {{ rule.match.url }}
              </code>
            </div>
            <div v-if="rule.match.methods?.length" class="py-2">
              <span class="mb-2 block text-sm text-text-muted">Methods</span>
              <div class="flex flex-wrap gap-1">
                <Badge v-for="method in rule.match.methods" :key="method" variant="secondary">
                  {{ method }}
                </Badge>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-text-muted">No match configured</p>
        </CardContent>
      </Card>

      <!-- Upstream card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Server class="h-4 w-4" />
            Upstream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="rule.upstream" class="space-y-3">
            <div
              v-if="rule.upstream.url"
              class="flex items-start justify-between border-b border-border-subtle py-2"
            >
              <span class="text-sm text-text-muted">URL</span>
              <code class="max-w-[60%] break-all text-right font-mono text-sm text-text-primary">
                {{ rule.upstream.url }}
              </code>
            </div>
            <div class="flex items-center justify-between border-b border-border-subtle py-2">
              <span class="text-sm text-text-muted">Preserve Host</span>
              <Badge :variant="rule.upstream.preserve_host ? 'success' : 'secondary'">
                {{ rule.upstream.preserve_host ? "Yes" : "No" }}
              </Badge>
            </div>
            <div v-if="rule.upstream.strip_path" class="flex items-start justify-between py-2">
              <span class="text-sm text-text-muted">Strip Path</span>
              <code class="max-w-[60%] break-all text-right font-mono text-sm text-text-primary">
                {{ rule.upstream.strip_path }}
              </code>
            </div>
          </div>
          <p v-else class="text-sm text-text-muted">No upstream configured</p>
        </CardContent>
      </Card>

      <!-- Authenticators card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Shield class="h-4 w-4" />
            Authenticators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="rule.authenticators?.length" class="space-y-4">
            <div
              v-for="(auth, index) in rule.authenticators"
              :key="index"
              class="rounded-lg bg-surface-raised p-4"
            >
              <Badge variant="outline">{{ auth.handler }}</Badge>
              <div v-if="hasConfig(auth)" class="mt-3">
                <JsonViewer :data="auth.config" :initial-expanded="false" max-height="300px" />
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-text-muted">None configured</p>
        </CardContent>
      </Card>

      <!-- Authorizer card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Lock class="h-4 w-4" />
            Authorizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="rule.authorizer" class="rounded-lg bg-surface-raised p-4">
            <Badge variant="outline">{{ rule.authorizer.handler }}</Badge>
            <div v-if="hasConfig(rule.authorizer)" class="mt-3">
              <JsonViewer
                :data="rule.authorizer.config"
                :initial-expanded="false"
                max-height="300px"
              />
            </div>
          </div>
          <p v-else class="text-sm text-text-muted">No authorizer configured</p>
        </CardContent>
      </Card>

      <!-- Mutators card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Shield class="h-4 w-4" />
            Mutators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="rule.mutators?.length" class="space-y-4">
            <div
              v-for="(mutator, index) in rule.mutators"
              :key="index"
              class="rounded-lg bg-surface-raised p-4"
            >
              <Badge variant="outline">{{ mutator.handler }}</Badge>
              <div v-if="hasConfig(mutator)" class="mt-3">
                <JsonViewer :data="mutator.config" :initial-expanded="false" max-height="300px" />
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-text-muted">None configured</p>
        </CardContent>
      </Card>

      <!-- Raw JSON card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <button
              class="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              :aria-expanded="rawJsonExpanded"
              @click="rawJsonExpanded = !rawJsonExpanded"
            >
              <ChevronDown v-if="rawJsonExpanded" class="h-4 w-4" />
              <ChevronRight v-else class="h-4 w-4" />
              <CardTitle class="text-base">Raw JSON</CardTitle>
            </button>
            <CopyButton :text="JSON.stringify(rule, null, 2)" label="Copy rule JSON" />
          </div>
        </CardHeader>
        <CardContent v-if="rawJsonExpanded">
          <JsonViewer :data="rule" :initial-expanded="true" max-height="600px" />
        </CardContent>
      </Card>
    </template>
  </div>
</template>
