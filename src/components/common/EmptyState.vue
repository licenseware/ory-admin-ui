<script setup lang="ts">
import { Inbox } from "lucide-vue-next"

interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: "No data",
  description: "There are no items to display.",
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="bg-surface-raised mb-4 rounded-full p-4">
      <slot name="icon">
        <Inbox class="text-text-muted h-8 w-8" />
      </slot>
    </div>
    <h3 class="text-text-primary mb-1 text-lg font-medium">{{ title }}</h3>
    <p class="text-text-muted max-w-sm text-sm">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
