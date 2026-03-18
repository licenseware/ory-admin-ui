<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue"
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "radix-vue"
import { ChevronDown, Check } from "lucide-vue-next"

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

// Track mount state to safely unmount portal content
const isMounted = ref(true)

onBeforeUnmount(() => {
  isMounted.value = false
})
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger
      :disabled="disabled"
      class="border-border bg-surface-raised text-text-primary placeholder:text-text-muted focus:ring-accent focus:ring-offset-surface flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDown class="text-text-muted h-4 w-4" />
    </SelectTrigger>
    <SelectPortal v-if="isMounted">
      <SelectContent
        class="animate-fade-in border-border bg-surface-raised relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-lg"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="text-text-primary focus:bg-surface-overlay data-[highlighted]:bg-surface-overlay relative flex cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <SelectItemIndicator
              class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
            >
              <Check class="text-accent h-4 w-4" />
            </SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
