import { createApp } from "vue"
import { createPinia } from "pinia"
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query"
import App from "./App.vue"
import router from "./router"
import { loadRuntimeProfiles } from "./config/loader"
import { useProfileStore } from "./stores/profile"
import "./assets/styles/main.css"

async function bootstrap() {
  // Load runtime profiles BEFORE initializing stores
  await loadRuntimeProfiles()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  app.use(VueQueryPlugin, { queryClient })

  // Initialize profile store after Pinia + VueQuery are installed
  const profileStore = useProfileStore()
  profileStore.setQueryClient(queryClient)
  profileStore.initialize()

  app.mount("#app")
}

bootstrap()
