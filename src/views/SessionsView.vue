<script setup lang="ts">
import { ref, computed, watch, toRef } from "vue"
import { RouterLink } from "vue-router"
import { useSessions, useRevokeSession } from "@/composables/useSessions"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Select from "@/components/ui/Select.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import AlertDialog from "@/components/ui/AlertDialog.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import Pagination from "@/components/common/Pagination.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { Search, Key, Eye, AlertTriangle, User, Filter, ArrowUpDown } from "@lucide/vue"
import { useUrlState } from "@/composables/useUrlState"
import { useSortState } from "@/composables/useSortState"
import type { Session } from "@/types/api"

// URL-synced filter/sort state
const { state: urlState, debounced } = useUrlState({
  search: { key: "search", defaultValue: "", debounce: 300 },
  active: { key: "active", defaultValue: "active" },
  sort: { key: "sort", defaultValue: "authenticated_at:desc" },
  page_size: {
    key: "page_size",
    defaultValue: 20,
    transform: { parse: Number, serialize: String },
  },
})

// Pagination state (not URL-synced)
const pageToken = ref<string | undefined>()
const prevTokens = ref<string[]>([])

const searchQuery = debounced.search
const activeFilter = toRef(urlState, "active")
const pageSize = toRef(urlState, "page_size")

const { sortValue, sortField, sortDir } = useSortState<"authenticated_at" | "expires_at">(
  urlState,
  "sort"
)

// Revoke dialog state
const revokeDialogOpen = ref(false)
const sessionToRevoke = ref<Session | null>(null)

// API params — reactive, maps activeFilter to the `active` boolean param
const apiParams = computed(() => ({
  page_size: pageSize.value,
  page_token: pageToken.value,
  active: activeFilter.value === "all" ? undefined : activeFilter.value === "active",
}))

const { data: result, isLoading, isFetching, isError, error, refetch } = useSessions(apiParams)
const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession()

const activeOptions = [
  { value: "all", label: "All sessions" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const sortOptions = [
  { value: "authenticated_at:desc", label: "Newest auth" },
  { value: "authenticated_at:asc", label: "Oldest auth" },
  { value: "expires_at:asc", label: "Expires soonest" },
  { value: "expires_at:desc", label: "Expires latest" },
]

// Client-side pipeline: search → sort on current page data
const processedSessions = computed(() => {
  if (!result.value) return []
  let items = [...result.value.data]

  // Client-side text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((session) => {
      const identity = session.identity
      const traits = (identity?.traits || {}) as Record<string, string>
      return (
        session.id.toLowerCase().includes(query) ||
        identity?.id?.toLowerCase().includes(query) ||
        (traits.email && traits.email.toLowerCase().includes(query))
      )
    })
  }

  // Sort
  items.sort((a, b) => {
    const aVal = new Date(a[sortField.value] || 0).getTime()
    const bVal = new Date(b[sortField.value] || 0).getTime()
    return sortDir.value === "asc" ? aVal - bVal : bVal - aVal
  })

  return items
})

// Pagination helpers
function resetPagination() {
  pageToken.value = undefined
  prevTokens.value = []
}

function goNext() {
  if (!result.value?.pagination.nextToken) return
  prevTokens.value = [...prevTokens.value, pageToken.value ?? ""]
  pageToken.value = result.value.pagination.nextToken
}

function goPrev() {
  if (!prevTokens.value.length) return
  const prev = prevTokens.value[prevTokens.value.length - 1]
  prevTokens.value = prevTokens.value.slice(0, -1)
  pageToken.value = prev || undefined
}

const hasNext = computed(() => !!result.value?.pagination.nextToken)
const hasPrev = computed(() => prevTokens.value.length > 0)

// Reset pagination when filter changes
watch(activeFilter, () => resetPagination())

function getSessionUser(session: Session): string {
  const identity = session.identity
  if (!identity) return "Unknown"
  const traits = (identity.traits || {}) as Record<string, string>
  return traits.email || traits.username || identity.id.slice(0, 8)
}

function confirmRevoke(session: Session) {
  sessionToRevoke.value = session
  revokeDialogOpen.value = true
}

function handleRevoke() {
  if (!sessionToRevoke.value) return
  revokeSession(sessionToRevoke.value.id, {
    onSuccess: () => {
      revokeDialogOpen.value = false
      sessionToRevoke.value = null
      refetch()
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-text-primary text-2xl font-semibold">Sessions</h1>
        <p class="text-text-muted mt-1 text-sm">View and manage active user sessions</p>
      </div>
      <ReloadButton :is-fetching="isFetching" @reload="refetch" />
    </div>

    <!-- Search and filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4">
          <!-- Search -->
          <div class="relative">
            <Search class="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              v-model="searchQuery"
              placeholder="Search by session ID, user email, or identity ID..."
              class="pl-10"
              clearable
            />
          </div>
          <!-- Filters row -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="flex items-center gap-2 sm:w-44">
              <Filter class="text-text-muted h-4 w-4 flex-shrink-0" />
              <Select
                v-model="activeFilter"
                :options="activeOptions"
                placeholder="All sessions"
                class="flex-1"
              />
            </div>
            <div class="flex items-center gap-2 sm:ml-auto sm:w-48">
              <ArrowUpDown class="text-text-muted h-4 w-4 flex-shrink-0" />
              <Select
                v-model="sortValue"
                :options="sortOptions"
                placeholder="Sort by"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sessions list -->
    <Card>
      <CardContent class="p-0">
        <!-- Loading state -->
        <div v-if="isLoading" class="space-y-3 p-4">
          <Skeleton v-for="i in 10" :key="i" class="h-16" />
        </div>

        <!-- Error state -->
        <ErrorState
          v-else-if="isError"
          :error="error"
          title="Failed to load sessions"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!processedSessions?.length"
          title="No sessions found"
          :description="
            searchQuery || activeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'There are no sessions'
          "
        >
          <template #icon>
            <Key class="text-text-muted h-8 w-8" />
          </template>
        </EmptyState>

        <!-- Session list -->
        <div v-else class="divide-border-subtle divide-y">
          <div
            v-for="session in processedSessions"
            :key="session.id"
            class="hover:bg-surface-raised flex items-center justify-between p-4 transition-colors"
          >
            <RouterLink
              :to="`/sessions/${session.id}`"
              class="flex min-w-0 flex-1 items-center gap-4"
            >
              <div
                class="bg-success/10 text-success flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              >
                <Key class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <div class="mb-1 flex items-center gap-2">
                  <p class="text-text-primary truncate text-sm font-medium">
                    {{ session.id.slice(0, 12) }}...
                  </p>
                  <StatusBadge :status="session.active ? 'active' : 'inactive'" />
                </div>
                <div class="text-text-muted flex items-center gap-2 text-xs">
                  <User class="h-3 w-3" />
                  <span class="truncate">{{ getSessionUser(session) }}</span>
                </div>
              </div>
            </RouterLink>

            <div class="flex items-center gap-4">
              <div class="hidden text-right sm:block">
                <p class="text-text-muted text-xs">Authenticated</p>
                <p class="text-text-secondary text-xs">
                  <TimeAgo :date="session.authenticated_at" />
                </p>
              </div>
              <div class="hidden text-right md:block">
                <p class="text-text-muted text-xs">Expires</p>
                <p class="text-text-secondary text-xs">
                  {{
                    session.expires_at ? new Date(session.expires_at).toLocaleDateString() : "Never"
                  }}
                </p>
              </div>

              <div class="flex items-center gap-1">
                <RouterLink :to="`/sessions/${session.id}`">
                  <Button variant="ghost" size="icon" title="View">
                    <Eye class="h-4 w-4" />
                  </Button>
                </RouterLink>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Revoke"
                  @click.prevent="confirmRevoke(session)"
                >
                  <AlertTriangle class="text-destructive h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="processedSessions?.length" class="border-border-subtle border-t p-4">
          <Pagination
            :has-next="hasNext"
            :has-prev="hasPrev"
            :page-size="pageSize"
            :item-count="processedSessions.length"
            @next="goNext"
            @prev="goPrev"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Revoke confirmation dialog -->
    <AlertDialog
      :open="revokeDialogOpen"
      title="Revoke Session"
      :description="`Are you sure you want to revoke this session? The user will be logged out immediately.`"
      confirm-text="Revoke"
      :loading="isRevoking"
      @confirm="handleRevoke"
      @cancel="revokeDialogOpen = false"
    />
  </div>
</template>
