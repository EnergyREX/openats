/**
 * Hooks de TanStack Query para el backoffice.
 *
 * Cada `queryFn` llama al cliente `api` y desempaqueta el resultado con `unwrap`,
 * de modo que un `ApiResult` fallido se convierte en un error que React Query
 * expone vía `isError` / `error`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  unwrap,
  type StatsResponse,
  type OffersResponse,
  type OfferDetail,
  type OfferCandidaciesResponse,
  type CandidatesResponse,
  type CandidateProfile,
} from '.'

export const queryKeys = {
  stats: ['stats'] as const,
  offers: ['offers'] as const,
  offer: (uuid: string) => ['offer', uuid] as const,
  offerCandidacies: (uuid: string) => ['offer-candidacies', uuid] as const,
  candidates: ['candidates'] as const,
  candidate: (uuid: string) => ['candidate', uuid] as const,
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => unwrap(await api.get<StatsResponse>('/api/v1/stats')),
  })
}

export function useOffers() {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: async () => unwrap(await api.get<OffersResponse>('/api/v1/offers')),
  })
}

export function useOffer(uuid: string) {
  return useQuery({
    queryKey: queryKeys.offer(uuid),
    queryFn: async () =>
      unwrap(await api.get<OfferDetail>(`/api/v1/offers/${encodeURIComponent(uuid)}`)),
    enabled: Boolean(uuid),
  })
}

export function useOfferCandidacies(uuid: string) {
  return useQuery({
    queryKey: queryKeys.offerCandidacies(uuid),
    queryFn: async () =>
      unwrap(
        await api.get<OfferCandidaciesResponse>(
          `/api/v1/offers/${encodeURIComponent(uuid)}/candidacies`,
        ),
      ),
    enabled: Boolean(uuid),
  })
}

export function useCandidate(uuid: string) {
  return useQuery({
    queryKey: queryKeys.candidate(uuid),
    queryFn: async () =>
      unwrap(await api.get<CandidateProfile>(`/api/v1/candidates/${encodeURIComponent(uuid)}`)),
    enabled: Boolean(uuid),
  })
}

/**
 * Mutaciones sobre el estado de una candidatura dentro de una oferta
 * (avanzar de fase, contratar, rechazar, retirar). Todas invalidan las
 * candidaturas de la oferta y las métricas/listados que dependen de ellas.
 */
function useCandidacyMutation<TVars>(
  offerUuid: string,
  mutationFn: (vars: TVars) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offerCandidacies(offerUuid) })
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
    },
  })
}

export function useAdvanceCandidacy(offerUuid: string) {
  return useCandidacyMutation(offerUuid, async (candidacyUuid: string) =>
    unwrap(await api.post(`/api/v1/candidacies/${encodeURIComponent(candidacyUuid)}/advance`)),
  )
}

export function useHireCandidacy(offerUuid: string) {
  return useCandidacyMutation(offerUuid, async (candidacyUuid: string) =>
    unwrap(await api.post(`/api/v1/candidacies/${encodeURIComponent(candidacyUuid)}/hire`)),
  )
}

export function useRejectCandidacy(offerUuid: string) {
  return useCandidacyMutation(
    offerUuid,
    async ({ candidacyUuid, reason }: { candidacyUuid: string; reason: string }) =>
      unwrap(
        await api.post(`/api/v1/candidacies/${encodeURIComponent(candidacyUuid)}/reject`, { reason }),
      ),
  )
}

export function useWithdrawCandidacy(offerUuid: string) {
  return useCandidacyMutation(offerUuid, async (candidacyUuid: string) =>
    unwrap(await api.post(`/api/v1/candidacies/${encodeURIComponent(candidacyUuid)}/withdraw`)),
  )
}

export function useCandidates() {
  return useQuery({
    queryKey: queryKeys.candidates,
    queryFn: async () =>
      unwrap(await api.get<CandidatesResponse>('/api/v1/candidates')),
  })
}

export interface CreateOfferInput {
  title: string
  body: string
  company: {
    name: string
    industry: string
    size: string
    website: string
  }
  location: {
    city: string
    country: string
    modality: string
  }
  salary: {
    min: number
    max: number
    currency: string
    period: string
    equity: boolean
  }
  contactDetails: {
    email?: string
    phoneNumber?: string
  }
  requirements: string[]
}

export function useCreateOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateOfferInput) =>
      unwrap(await api.post('/api/v1/offers', { ...input })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats })
    },
  })
}
