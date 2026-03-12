<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue"
import { RouterLink } from "vue-router"
import { useRules, useOathkeeperHealth, useOathkeeperVersion } from "@/composables/useOathkeeper"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Badge from "@/components/ui/Badge.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { Shield, Plus, Search, Copy, Eye, Activity, ArrowLeft, ArrowRight } from "lucide-vue-next"
import type { Rule } from "@/types/oathkeeper"

// Pagination state
const pageSize = 20
const currentPage = ref(1)

const apiParams = computed(() => ({
  limit: pageSize,
  offset: (currentPage.value - 1) * pageSize,
}))

// Data fetching
const { data: rules, isLoading, isFetching, isError, error, refetch } = useRules(apiParams)

const {
  isError: healthError,
  isFetching: healthFetching,
  refetch: refetchHealth,
} = useOathkeeperHealth()

const {
  data: versionData,
  isFetching: versionFetching,
  refetch: refetchVersion,
} = useOathkeeperVersion()

// Search
const searchQuery = ref("")
const debouncedSearch = ref("")
let searchTimeout: ReturnType<typeof setTimeout> | undefined

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})

// Filtered rules (client-side search)
const filteredRules = computed(() => {
  if (!rules.value) return []
  if (!debouncedSearch.value) return rules.value

  const q = debouncedSearch.value.toLowerCase()
  return rules.value.filter((rule) => {
    const id = (rule.id ?? "").toLowerCase()
    const description = (rule.description ?? "").toLowerCase()
    return id.includes(q) || description.includes(q)
  })
})

// Pagination helpers
const hasNext = computed(() => rules.value?.length === pageSize)
const hasPrev = computed(() => currentPage.value > 1)

function goNext() {
  if (hasNext.value) currentPage.value++
}

function goPrev() {
  if (hasPrev.value) currentPage.value--
}

// Reload all data
const isAnyFetching = computed(
  () => isFetching.value || healthFetching.value || versionFetching.value
)

function reloadAll() {
  refetch()
  refetchHealth()
  refetchVersion()
}

// Stats
const stats = computed(() => [
  {
    name: "On This Page",
    value: filteredRules.value.length,
    icon: Shield,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    name: "Health",
    value: healthError.value ? "Unhealthy" : "Healthy",
    icon: Activity,
    color: healthError.value ? "text-destructive" : "text-success",
    bgColor: healthError.value ? "bg-destructive/10" : "bg-success/10",
  },
  {
    name: "Version",
    value: versionData.value?.version ?? "...",
    icon: Activity,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
])

function getRuleMethods(rule: Rule): string[] {
  return rule.match?.methods ?? []
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">Access Rules</h1>
        <p class="mt-1 text-sm text-text-muted">Manage Oathkeeper access rules</p>
      </div>
      <div class="flex items-center gap-2">
        <ReloadButton :is-fetching="isAnyFetching" @reload="reloadAll" />
        <RouterLink to="/rules/new">
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="grid gap-4 sm:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.name">
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted">{{ stat.name }}</p>
              <p class="mt-1 text-2xl font-semibold text-text-primary">
                {{ stat.value }}
              </p>
            </div>
            <div :class="[stat.bgColor, 'rounded-lg p-2']">
              <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Search bar -->
    <Card>
      <CardContent class="p-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            v-model="searchQuery"
            placeholder="Search by rule ID or description..."
            class="pl-10"
            clearable
            aria-label="Search rules"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Rules list -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-base">Rules</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="space-y-3 p-4">
          <Skeleton v-for="i in 8" :key="i" class="h-16" />
        </div>

        <!-- Error state -->
        <ErrorState
          v-else-if="isError"
          :error="error"
          title="Failed to load rules"
          description="Could not connect to the Oathkeeper API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!filteredRules.length"
          :title="debouncedSearch ? 'No matching rules' : 'No rules found'"
          :description="
            debouncedSearch
              ? 'Try adjusting your search query'
              : 'Create your first access rule to get started'
          "
        >
          <template #icon>
            <Shield class="h-8 w-8 text-text-muted" />
          </template>
          <template v-if="!debouncedSearch" #action>
            <RouterLink to="/rules/new">
              <Button>
                <Plus class="mr-2 h-4 w-4" />
                New Rule
              </Button>
            </RouterLink>
          </template>
        </EmptyState>

        <!-- Rules list -->
        <div v-else class="divide-y divide-border-subtle">
          <div
            v-for="rule in filteredRules"
            :key="rule.id"
            class="group flex items-center justify-between p-4 transition-colors hover:bg-surface-raised"
          >
            <RouterLink :to="`/rules/${rule.id}`" class="flex min-w-0 flex-1 items-center gap-4">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
              >
                <Shield class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-text-primary">
                  {{ rule.id ?? "Unnamed rule" }}
                </p>
                <p class="truncate text-xs text-text-muted">
                  {{ rule.match?.url ?? "No match URL" }}
                </p>
              </div>
            </RouterLink>

            <div class="flex items-center gap-3">
              <div class="hidden flex-wrap gap-1 sm:flex">
                <Badge
                  v-for="method in getRuleMethods(rule)"
                  :key="method"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ method }}
                </Badge>
              </div>

              <div class="flex items-center gap-1">
                <RouterLink :to="`/rules/${rule.id}`">
                  <Button variant="ghost" size="icon" title="View rule">
                    <Eye class="h-4 w-4" />
                  </Button>
                </RouterLink>
                <RouterLink :to="`/rules/new?clone=${rule.id}`">
                  <Button variant="ghost" size="icon" title="Clone rule">
                    <Copy class="h-4 w-4" />
                  </Button>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredRules.length && !debouncedSearch"
          class="flex items-center justify-between border-t border-border-subtle p-4"
        >
          <Button variant="outline" size="sm" :disabled="!hasPrev" @click="goPrev">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span class="text-sm text-text-muted">Page {{ currentPage }}</span>
          <Button variant="outline" size="sm" :disabled="!hasNext" @click="goNext">
            Next
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
