<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue"
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "radix-vue"
import Button from "./Button.vue"

interface Props {
  open?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  open: false,
  title: "Are you sure?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
  loading: false,
})

// Track mount state for safe portal cleanup
const isMounted = ref(true)
onBeforeUnmount(() => {
  isMounted.value = false
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit("confirm")
  // Don't auto-close when loading - let the parent control this
}

function handleCancel() {
  emit("cancel")
  emit("update:open", false)
}
</script>

<template>
  <AlertDialogRoot :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogTrigger as-child>
      <slot name="trigger" />
    </AlertDialogTrigger>
    <AlertDialogPortal v-if="isMounted">
      <AlertDialogOverlay
        class="data-[state=open]:animate-fade-in fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <AlertDialogContent
        class="border-border bg-surface-raised data-[state=open]:animate-scale-in fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 shadow-2xl sm:max-w-md sm:p-6"
      >
        <AlertDialogTitle class="text-text-primary text-lg font-medium">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription v-if="description" class="text-text-muted mt-2 text-sm">
          {{ description }}
        </AlertDialogDescription>
        <div class="mt-6 flex justify-end gap-3">
          <AlertDialogCancel as-child>
            <Button variant="outline" @click="handleCancel">
              {{ cancelText }}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button
              :variant="variant === 'destructive' ? 'destructive' : 'default'"
              :disabled="loading"
              @click="handleConfirm"
            >
              {{ loading ? "Loading..." : confirmText }}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
