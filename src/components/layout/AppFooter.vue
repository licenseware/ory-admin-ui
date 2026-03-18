<script setup lang="ts">
import { useVersion } from "@/composables/useHealth"

const appVersion = __APP_VERSION__
const { data: versionData } = useVersion()
</script>

<template>
  <footer class="border-border-subtle text-text-muted border-t px-3 py-3 text-sm md:px-6 md:py-4">
    <div
      class="mx-auto flex max-w-screen-2xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <div class="flex items-center gap-2">
        <a
          :href="`https://github.com/licenseware/ory-admin-ui/releases/tag/v${appVersion}`"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-text-secondary transition-colors"
        >
          Ory Admin UI v{{ appVersion }}
        </a>
        <span v-if="versionData?.version" class="text-text-muted">
          &middot;
          <a
            :href="`https://github.com/ory/kratos/releases/tag/${versionData.version}`"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-text-secondary transition-colors"
          >
            Kratos {{ versionData.version }}
          </a>
        </span>
      </div>
      <div class="flex items-center gap-4">
        <a
          href="https://github.com/licenseware/ory-admin-ui"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.ory.sh/docs/kratos"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-text-secondary transition-colors"
        >
          Kratos Docs
        </a>
      </div>
    </div>
  </footer>
</template>
