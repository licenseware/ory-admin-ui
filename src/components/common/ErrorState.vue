<script setup lang="ts">
import { AlertTriangle, RefreshCw } from "@lucide/vue"
import Button from "@/components/ui/Button.vue"

interface Props {
  title?: string
  description?: string
  error?: Error | null
  retryable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: "Something went wrong",
  description: "An error occurred while loading the data.",
  retryable: true,
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="bg-destructive/10 mb-4 rounded-full p-4">
      <AlertTriangle class="text-destructive h-8 w-8" />
    </div>
    <h3 class="text-text-primary mb-1 text-lg font-medium">{{ title }}</h3>
    <p class="text-text-muted mb-2 max-w-sm text-sm">{{ description }}</p>
    <p v-if="error" class="text-destructive mb-4 font-mono text-xs">
      {{ error.message }}
    </p>
    <Button v-if="retryable" variant="outline" @click="emit('retry')">
      <RefreshCw class="mr-2 h-4 w-4" />
      Try again
    </Button>
  </div>
</template>
