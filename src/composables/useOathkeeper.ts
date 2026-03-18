import { useQuery } from "@tanstack/vue-query"
import { computed, type Ref } from "vue"
import { oathkeeperApi, type RuleListParams } from "@/api/oathkeeper"

export function useRules(params?: Ref<RuleListParams>) {
  return useQuery({
    queryKey: ["oathkeeper", "rules", params],
    queryFn: () => oathkeeperApi.listRules(params?.value),
    staleTime: 30_000,
  })
}

export function useRule(id: Ref<string>) {
  return useQuery({
    queryKey: ["oathkeeper", "rule", id],
    queryFn: () => oathkeeperApi.getRule(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 30_000,
  })
}

export function useOathkeeperHealth(options?: { enabled?: Ref<boolean> }) {
  return useQuery({
    queryKey: ["oathkeeper", "health"],
    queryFn: () => oathkeeperApi.getHealth(),
    enabled: options?.enabled,
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: 1,
  })
}

export function useOathkeeperReady() {
  return useQuery({
    queryKey: ["oathkeeper", "ready"],
    queryFn: () => oathkeeperApi.getReady(),
    staleTime: 10_000,
    retry: 1,
  })
}

export function useOathkeeperVersion() {
  return useQuery({
    queryKey: ["oathkeeper", "version"],
    queryFn: () => oathkeeperApi.getVersion(),
    staleTime: 60_000 * 5,
  })
}

export function useJWKS() {
  return useQuery({
    queryKey: ["oathkeeper", "jwks"],
    queryFn: () => oathkeeperApi.getJWKS(),
    staleTime: 60_000,
  })
}
