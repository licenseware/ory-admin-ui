<script setup lang="ts">
import { TabsTrigger } from "radix-vue"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  class: undefined,
})
</script>

<template>
  <TabsTrigger
    :value="props.value"
    :disabled="props.disabled"
    :class="
      cn(
        'text-text-muted focus-visible:ring-accent focus-visible:ring-offset-surface data-[state=active]:bg-surface-raised data-[state=active]:text-text-primary inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
        props.class
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
