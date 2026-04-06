<script setup lang="ts">
import { computed, watch } from "vue"
import { useRoute, useRouter, RouterView } from "vue-router"
import { useUIStore } from "@/stores/ui"
import { useProfileStore } from "@/stores/profile"
import { useBreakpoints } from "@/composables/useBreakpoints"
import { toast } from "vue-sonner"
import AppSidebar from "./AppSidebar.vue"
import AppHeader from "./AppHeader.vue"
import AppFooter from "./AppFooter.vue"

const uiStore = useUIStore()
const profileStore = useProfileStore()
const route = useRoute()
const router = useRouter()
const { isMobile } = useBreakpoints()

const mainMargin = computed(() => {
  if (isMobile.value) return "ml-0"
  return uiStore.sidebarCollapsed ? "ml-16" : "ml-64"
})

// Sync ?profile= query param → profile store
watch(
  () => route.query.profile,
  (profileSlug) => {
    if (typeof profileSlug !== "string" || !profileSlug) return
    if (profileSlug === profileStore.activeSlug) return

    const exists = profileStore.allProfiles.some((p) => p.slug === profileSlug)
    if (exists) {
      profileStore.switchProfile(profileSlug)
    } else {
      const safeSlug = String(profileSlug).slice(0, 64)
      toast.warning(
        `Profile "${safeSlug}" not found, using "${profileStore.activeProfile?.name || profileStore.activeSlug}"`
      )
      router.replace({
        path: route.path,
        query: { ...route.query, profile: profileStore.activeSlug },
        hash: route.hash,
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="bg-surface min-h-screen">
    <AppSidebar />
    <div :class="[mainMargin, 'flex min-h-screen flex-col transition-all duration-200']">
      <AppHeader />
      <main class="flex-1 p-3 md:p-6">
        <div class="mx-auto max-w-screen-2xl">
          <RouterView />
        </div>
      </main>
      <AppFooter />
    </div>
  </div>
</template>
