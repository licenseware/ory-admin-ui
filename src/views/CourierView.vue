<script setup lang="ts">
import { ref, computed, toRef } from "vue"
import { useCourierMessages } from "@/composables/useCourier"
import Card from "@/components/ui/Card.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Skeleton from "@/components/ui/Skeleton.vue"
import Badge from "@/components/ui/Badge.vue"
import Dialog from "@/components/ui/Dialog.vue"
import Select from "@/components/ui/Select.vue"
import TimeAgo from "@/components/common/TimeAgo.vue"
import StatusBadge from "@/components/common/StatusBadge.vue"
import EmptyState from "@/components/common/EmptyState.vue"
import ErrorState from "@/components/common/ErrorState.vue"
import Pagination from "@/components/common/Pagination.vue"
import JsonViewer from "@/components/common/JsonViewer.vue"
import ReloadButton from "@/components/common/ReloadButton.vue"
import { Search, Mail, Eye, Filter } from "lucide-vue-next"
import { useUrlState } from "@/composables/useUrlState"
import type { Message } from "@/types/api"

const STATUS_ALL = "all" as const

// URL-synced state
const { state: urlState, debounced } = useUrlState({
  search: { key: "search", defaultValue: "", debounce: 300 },
  status: { key: "status", defaultValue: STATUS_ALL as string },
  page_size: {
    key: "page_size",
    defaultValue: 20,
    transform: { parse: Number, serialize: String },
  },
})

const searchQuery = debounced.search
const statusFilter = toRef(urlState, "status")
const pageSize = toRef(urlState, "page_size")
const selectedMessage = ref<Message | null>(null)
const detailDialogOpen = ref(false)

const { data: messages, isLoading, isFetching, isError, error, refetch } = useCourierMessages()

const statusOptions = [
  { value: STATUS_ALL, label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "processing", label: "Processing" },
  { value: "abandoned", label: "Abandoned" },
]

const filteredMessages = computed(() => {
  if (!messages.value?.data) return []
  let result = messages.value.data

  if (statusFilter.value !== STATUS_ALL) {
    result = result.filter((m) => m.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((message) => {
      return (
        message.id.toLowerCase().includes(query) ||
        message.recipient.toLowerCase().includes(query) ||
        (message.subject && message.subject.toLowerCase().includes(query)) ||
        (message.template_type && message.template_type.toLowerCase().includes(query))
      )
    })
  }

  return result
})

function viewMessage(message: Message) {
  selectedMessage.value = message
  detailDialogOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-text-primary text-2xl font-semibold">Courier Messages</h1>
        <p class="text-text-muted mt-1 text-sm">View email and SMS messages sent by Kratos</p>
      </div>
      <ReloadButton :is-fetching="isFetching" @reload="refetch" />
    </div>

    <!-- Search and filters -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4 sm:flex-row">
          <div class="relative flex-1">
            <Search class="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              v-model="searchQuery"
              placeholder="Search by recipient, subject, or template..."
              class="pl-10"
              clearable
            />
          </div>
          <div class="flex w-full items-center gap-2 sm:w-48">
            <Filter class="text-text-muted h-4 w-4 flex-shrink-0" />
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="All statuses"
              class="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Messages list -->
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
          title="Failed to load messages"
          description="Could not connect to the Kratos API"
          @retry="refetch"
          class="py-8"
        />

        <!-- Empty state -->
        <EmptyState
          v-else-if="!filteredMessages?.length"
          title="No messages found"
          :description="
            searchQuery || statusFilter
              ? 'Try adjusting your filters'
              : 'No courier messages have been sent yet'
          "
        >
          <template #icon>
            <Mail class="text-text-muted h-8 w-8" />
          </template>
        </EmptyState>

        <!-- Message list -->
        <div v-else class="divide-border-subtle divide-y">
          <div
            v-for="message in filteredMessages"
            :key="message.id"
            class="hover:bg-surface-raised flex cursor-pointer items-center justify-between p-4 transition-colors"
            @click="viewMessage(message)"
          >
            <div class="flex min-w-0 flex-1 items-center gap-4">
              <div
                class="bg-warning/10 text-warning flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              >
                <Mail class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <div class="mb-1 flex items-center gap-2">
                  <p class="text-text-primary truncate text-sm font-medium">
                    {{ message.recipient }}
                  </p>
                  <Badge variant="outline" class="text-xs">
                    {{ message.type || "email" }}
                  </Badge>
                </div>
                <p class="text-text-muted truncate text-xs">
                  {{ message.subject || message.template_type || "No subject" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="hidden text-right sm:block">
                <p class="text-text-muted text-xs">Sent</p>
                <p class="text-text-secondary text-xs">
                  <TimeAgo :date="message.created_at" />
                </p>
              </div>
              <StatusBadge :status="message.status" />
              <Button
                variant="ghost"
                size="icon"
                title="View details"
                @click.stop="viewMessage(message)"
              >
                <Eye class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredMessages?.length" class="border-border-subtle border-t p-4">
          <Pagination
            :has-next="false"
            :has-prev="false"
            :page-size="pageSize"
            :item-count="filteredMessages.length"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Message detail dialog -->
    <Dialog :open="detailDialogOpen" @update:open="detailDialogOpen = $event">
      <template #title>Message Details</template>
      <template #description> View the full details of this courier message </template>

      <div v-if="selectedMessage" class="space-y-4">
        <!-- Message header -->
        <div class="bg-surface-raised flex items-center justify-between rounded-lg p-4">
          <div>
            <p class="text-text-primary text-sm font-medium">{{ selectedMessage.recipient }}</p>
            <p class="text-text-muted text-xs">{{ selectedMessage.subject || "No subject" }}</p>
          </div>
          <StatusBadge :status="selectedMessage.status" />
        </div>

        <!-- Message info -->
        <div class="space-y-2">
          <div class="border-border-subtle flex justify-between border-b py-2">
            <span class="text-text-muted text-sm">Type</span>
            <Badge variant="outline">{{ selectedMessage.type || "email" }}</Badge>
          </div>
          <div class="border-border-subtle flex justify-between border-b py-2">
            <span class="text-text-muted text-sm">Template</span>
            <span class="text-text-primary text-sm">{{
              selectedMessage.template_type || "N/A"
            }}</span>
          </div>
          <div class="border-border-subtle flex justify-between border-b py-2">
            <span class="text-text-muted text-sm">Created</span>
            <span class="text-text-primary text-sm">
              {{ new Date(selectedMessage.created_at).toLocaleString() }}
            </span>
          </div>
          <div
            v-if="selectedMessage.updated_at"
            class="border-border-subtle flex justify-between border-b py-2"
          >
            <span class="text-text-muted text-sm">Updated</span>
            <span class="text-text-primary text-sm">
              {{ new Date(selectedMessage.updated_at).toLocaleString() }}
            </span>
          </div>
          <div v-if="selectedMessage.send_count !== undefined" class="flex justify-between py-2">
            <span class="text-text-muted text-sm">Send attempts</span>
            <span class="text-text-primary text-sm">{{ selectedMessage.send_count }}</span>
          </div>
        </div>

        <!-- Message body preview -->
        <div v-if="selectedMessage.body">
          <h4 class="text-text-secondary mb-2 text-sm font-medium">Message Body</h4>
          <div class="bg-surface-raised max-h-48 overflow-auto rounded-lg p-4">
            <pre class="text-text-primary text-xs whitespace-pre-wrap">{{
              selectedMessage.body
            }}</pre>
          </div>
        </div>

        <!-- Raw JSON -->
        <div>
          <h4 class="text-text-secondary mb-2 text-sm font-medium">Raw Data</h4>
          <JsonViewer :data="selectedMessage" :initial-expanded="false" max-height="200px" />
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="detailDialogOpen = false">Close</Button>
      </template>
    </Dialog>
  </div>
</template>
