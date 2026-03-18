<script setup lang="ts">
import { RouterLink } from "vue-router"
import Button from "@/components/ui/Button.vue"
import { Home, ArrowLeft } from "lucide-vue-next"
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <div class="text-accent/20 mb-4 text-8xl font-bold">404</div>
    <h1 class="text-text-primary mb-2 text-2xl font-semibold">Page not found</h1>
    <p class="text-text-muted mb-8 max-w-md">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="flex gap-4">
      <Button variant="outline" @click="$router.back()">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Go back
      </Button>
      <RouterLink to="/">
        <Button>
          <Home class="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
