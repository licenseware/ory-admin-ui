<script setup lang="ts">
import { ref, computed } from "vue"
import { useJWKS } from "@/composables/useOathkeeper"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Badge from "@/components/ui/Badge.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import CopyButton from "@/components/common/CopyButton.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { KeyRound, ChevronDown } from "lucide-vue-next"
import { cn } from "@/lib/utils"

const showRawJson = ref(false)

const { data: jwks, isLoading, isFetching, isError, error, refetch } = useJWKS()

const keys = computed(() => jwks.value?.keys ?? [])

const jwksJson = computed(() => JSON.stringify(jwks.value, null, 2))

function getUseBadgeVariant(use?: string): "default" | "secondary" | "success" | "warning" {
  if (use === "sig") return "success"
  if (use === "enc") return "warning"
  return "secondary"
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">JWKS Keys</h1>
        <p class="mt-1 text-sm text-text-muted">
          Cryptographic keys used by Oathkeeper for token verification
        </p>
      </div>
      <ReloadButton :is-fetching="isFetching" @reload="refetch" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-40" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="isError"
      :error="error"
      title="Failed to load JWKS"
      description="Could not retrieve cryptographic keys from the Oathkeeper API"
      @retry="refetch"
    />

    <!-- Empty state -->
    <EmptyState
      v-else-if="!keys.length"
      title="No cryptographic keys found"
      description="No JWKS keys are configured in the Oathkeeper instance"
    >
      <template #icon>
        <KeyRound class="h-8 w-8 text-text-muted" />
      </template>
    </EmptyState>

    <!-- Keys grid -->
    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="(key, index) in keys" :key="key.kid ?? index">
          <CardHeader class="pb-2">
            <div class="flex items-start justify-between">
              <div class="flex min-w-0 items-center gap-2">
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
                >
                  <KeyRound class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <CardTitle class="truncate font-mono text-base">
                    {{ key.kid ?? "unnamed" }}
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <!-- Key type -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-text-muted">Type</span>
                <Badge v-if="key.kty" variant="default">{{ key.kty }}</Badge>
                <span v-else class="text-xs text-text-muted">-</span>
              </div>

              <!-- Algorithm -->
              <div v-if="key.alg" class="flex items-center gap-2">
                <span class="text-xs text-text-muted">Algorithm</span>
                <Badge variant="secondary">{{ key.alg }}</Badge>
              </div>

              <!-- Usage -->
              <div v-if="key.use" class="flex items-center gap-2">
                <span class="text-xs text-text-muted">Usage</span>
                <Badge :variant="getUseBadgeVariant(key.use)">{{ key.use }}</Badge>
              </div>

              <!-- Curve (for EC keys) -->
              <div v-if="key.crv" class="flex items-center gap-2">
                <span class="text-xs text-text-muted">Curve</span>
                <Badge variant="outline">{{ key.crv }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Raw JSON section -->
      <div class="mt-6 border-t border-border-subtle pt-4">
        <div class="flex items-center justify-between">
          <button
            class="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            :aria-expanded="showRawJson"
            @click="showRawJson = !showRawJson"
          >
            <ChevronDown :class="cn('h-4 w-4 transition-transform', showRawJson && 'rotate-180')" />
            Raw JWKS
          </button>
          <CopyButton :text="jwksJson" label="Copy JWKS JSON" />
        </div>
        <div v-if="showRawJson" class="mt-2">
          <JsonViewer :data="jwks" :initial-expanded="true" max-height="400px" />
        </div>
      </div>
    </template>
  </div>
</template>
