<script setup lang="ts">
import { computed, ref } from "vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { RouterLink } from "vue-router"
import { useIdentities, useIdentitiesCount } from "@/composables/useIdentities"
import { useSessions } from "@/composables/useSessions"
import { useCourierMessages } from "@/composables/useCourier"
import { useSystemHealth } from "@/composables/useHealth"
import { useBreakpoints } from "@/composables/useBreakpoints"
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import Badge from "@/components/ui/Badge.vue"
import { useProfileStore } from "@/stores/profile"
import { Users, Key, Mail, Activity, ArrowRight, Circle } from "lucide-vue-next"

const profileStore = useProfileStore()

const dashboardParams = ref({ page_size: 10 })
const { sm: isDesktop } = useBreakpoints()
const recentCount = computed(() => (isDesktop.value ? 10 : 5))

const {
  data: identities,
  isLoading: identitiesLoading,
  isFetching: identitiesFetching,
  isError: identitiesError,
  error: identitiesErrorObj,
  refetch: refetchIdentities,
} = useIdentities(dashboardParams)
const {
  data: identitiesCount,
  isFetching: identitiesCountFetching,
  refetch: refetchIdentitiesCount,
} = useIdentitiesCount()
const {
  data: sessions,
  isLoading: sessionsLoading,
  isFetching: sessionsFetching,
  isError: sessionsError,
  error: sessionsErrorObj,
  refetch: refetchSessions,
} = useSessions(dashboardParams)
const {
  data: messages,
  isLoading: messagesLoading,
  isFetching: messagesFetching,
  isError: messagesError,
  error: messagesErrorObj,
  refetch: refetchMessages,
} = useCourierMessages(dashboardParams)
const {
  status: healthStatus,
  colorClass: healthColor,
  bgColorClass: healthBgColor,
} = useSystemHealth()

const isAnyFetching = computed(
  () =>
    identitiesFetching.value ||
    identitiesCountFetching.value ||
    sessionsFetching.value ||
    messagesFetching.value
)

function reloadAll() {
  refetchIdentities()
  refetchIdentitiesCount()
  refetchSessions()
  refetchMessages()
}
const recentIdentities = computed(() => {
  return identities.value?.data.slice(0, recentCount.value) || []
})
const recentSessions = computed(() => {
  return sessions.value?.data.slice(0, recentCount.value) || []
})
const recentMessages = computed(() => {
  return messages.value?.data?.slice(0, recentCount.value) || []
})

const stats = computed(() => [
  {
    name: "Identities",
    value: identitiesCount.value ?? 0,
    icon: Users,
    href: "/identities",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    name: "Active Sessions",
    value: sessions.value?.pagination?.totalCount ?? sessions.value?.data?.length ?? 0,
    icon: Key,
    href: "/sessions",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    name: "Messages",
    value: messages.value?.pagination?.totalCount ?? messages.value?.data?.length ?? 0,
    icon: Mail,
    href: "/courier",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    name: "API Status",
    value:
      healthStatus.value === "healthy"
        ? "Healthy"
        : healthStatus.value === "degraded"
          ? "Degraded"
          : "Offline",
    icon: Activity,
    href: "/settings",
    color: healthColor.value,
    bgColor: healthBgColor.value,
  },
])

function getIdentityName(identity: any): string {
  const traits = identity.traits || {}
  return traits.email || traits.username || traits.name || identity.id.slice(0, 8)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-text-primary text-2xl font-semibold">Dashboard</h1>
        <div class="mt-1 flex items-center gap-2">
          <p class="text-text-muted text-sm">Overview of your Ory Kratos instance</p>
          <Badge variant="outline" class="gap-1">
            <Circle class="fill-accent text-accent h-1.5 w-1.5" />
            {{ profileStore.activeProfile?.slug }}
          </Badge>
        </div>
      </div>
      <ReloadButton :is-fetching="isAnyFetching" @reload="reloadAll" />
    </div>

    <!-- Stats grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink v-for="stat in stats" :key="stat.name" :to="stat.href" class="group">
        <Card class="hover:border-border-default transition-colors">
          <CardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm">{{ stat.name }}</p>
                <p class="text-text-primary mt-1 text-2xl font-semibold">
                  {{ stat.value }}
                </p>
              </div>
              <div :class="[stat.bgColor, 'rounded-lg p-2']">
                <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </RouterLink>
    </div>

    <!-- Recent items grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent identities -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Identities</CardTitle>
          <RouterLink
            to="/identities"
            class="text-accent hover:text-accent-hover flex items-center gap-1 text-sm"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="identitiesLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="identitiesError"
            :error="identitiesErrorObj"
            title="Failed to load identities"
            @retry="refetchIdentities"
          />
          <div v-else-if="identities?.data?.length" class="space-y-2">
            <RouterLink
              v-for="identity in recentIdentities"
              :key="identity.id"
              :to="`/identities/${identity.id}`"
              class="hover:bg-surface-raised flex items-center justify-between rounded-lg p-2 transition-colors"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="bg-accent/10 text-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium"
                >
                  {{ getIdentityName(identity).charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-text-primary mb-1 truncate text-sm font-medium">
                    {{ getIdentityName(identity) }}
                  </p>
                  <p class="text-text-muted truncate text-xs">
                    {{ identity.id }}
                  </p>
                </div>
              </div>
              <div class="text-text-muted flex-shrink-0 text-xs">
                <TimeAgo :date="identity.created_at" />
              </div>
            </RouterLink>
          </div>
          <EmptyState
            v-else
            title="No identities"
            description="No identities have been created yet"
          >
            <template #icon>
              <Users class="text-text-muted h-8 w-8" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>

      <!-- Recent sessions -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Sessions</CardTitle>
          <RouterLink
            to="/sessions"
            class="text-accent hover:text-accent-hover flex items-center gap-1 text-sm"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="sessionsLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="sessionsError"
            :error="sessionsErrorObj"
            title="Failed to load sessions"
            @retry="refetchSessions"
          />
          <div v-else-if="sessions?.data?.length" class="space-y-2">
            <RouterLink
              v-for="session in recentSessions"
              :key="session.id"
              :to="`/sessions/${session.id}`"
              class="hover:bg-surface-raised flex items-center justify-between rounded-lg p-2 transition-colors"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="bg-success/10 text-success flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                >
                  <Key class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-text-primary mb-1 truncate text-sm font-medium">
                    {{ session.id.slice(0, 8) }}...
                  </p>
                  <p class="text-text-muted text-xs">
                    {{ session.identity?.traits?.email || "Unknown user" }}
                  </p>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                <StatusBadge :status="session.active ? 'active' : 'inactive'" />
              </div>
            </RouterLink>
          </div>
          <EmptyState v-else title="No sessions" description="No active sessions at the moment">
            <template #icon>
              <Key class="text-text-muted h-8 w-8" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>

      <!-- Recent messages -->
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Courier Messages</CardTitle>
          <RouterLink
            to="/courier"
            class="text-accent hover:text-accent-hover flex items-center gap-1 text-sm"
          >
            View all
            <ArrowRight class="h-3 w-3" />
          </RouterLink>
        </CardHeader>
        <CardContent>
          <div v-if="messagesLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-12" />
          </div>
          <ErrorState
            v-else-if="messagesError"
            :error="messagesErrorObj"
            title="Failed to load messages"
            @retry="refetchMessages"
          />
          <div v-else-if="messages?.data?.length" class="space-y-2">
            <div
              v-for="message in recentMessages"
              :key="message.id"
              class="hover:bg-surface-raised flex items-center justify-between rounded-lg p-2 transition-colors"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="bg-warning/10 text-warning flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                >
                  <Mail class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-text-primary truncate text-sm font-medium">
                    {{ message.recipient }}
                  </p>
                  <p class="text-text-muted truncate text-xs">
                    {{ message.subject || message.template_type || "No subject" }}
                  </p>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                <StatusBadge :status="message.status" />
                <span class="text-text-muted text-xs">
                  <TimeAgo :date="message.created_at" />
                </span>
              </div>
            </div>
          </div>
          <EmptyState
            v-else
            title="No messages"
            description="No courier messages have been sent yet"
          >
            <template #icon>
              <Mail class="text-text-muted h-8 w-8" />
            </template>
          </EmptyState>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
