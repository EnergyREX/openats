/**
 * Capa de datos del frontoffice (páginas públicas de ofertas).
 *
 * Las consultas de ofertas son anónimas (sin token). El envío de la candidatura
 * es multipart (CV) y por eso no usa el cliente JSON `api`, sino un `fetch`
 * directo con `FormData`.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, unwrap } from '.'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6500'

// ---------- Tipos públicos (contrato con el backend) ----------

export interface PublicOffer {
  uuid: string
  title: string
  body: string
  company: { name: string; industry: string } | null
  location: { city: string; country: string; modality: string } | null
  salary: { min: number; max: number; currency: string; period: string } | null
  requirements: string[]
}

export interface PublicOffersResponse {
  offers: PublicOffer[]
}

// ---------- Queries ----------

export const publicKeys = {
  offers: ['public-offers'] as const,
  offer: (uuid: string) => ['public-offer', uuid] as const,
}

export function usePublicOffers() {
  return useQuery({
    queryKey: publicKeys.offers,
    queryFn: async () =>
      unwrap(await api.get<PublicOffersResponse>('/api/v1/public/offers')),
  })
}

export function usePublicOffer(uuid: string) {
  return useQuery({
    queryKey: publicKeys.offer(uuid),
    queryFn: async () =>
      unwrap(await api.get<PublicOffer>(`/api/v1/public/offers/${encodeURIComponent(uuid)}`)),
    enabled: Boolean(uuid),
  })
}

// ---------- Candidatura (multipart) ----------

export interface ApplicationInput {
  name: string
  email: string
  phoneNum?: string
  website?: string
  cv: File
}

async function submitApplication(uuid: string, input: ApplicationInput): Promise<void> {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('email', input.email)
  if (input.phoneNum) formData.append('phoneNum', input.phoneNum)
  if (input.website) formData.append('website', input.website)
  formData.append('cv', input.cv, input.cv.name)

  const res = await fetch(`${BASE_URL}/api/v1/postulation/${encodeURIComponent(uuid)}`, {
    method: 'POST',
    body: formData,
    // No fijar Content-Type: el navegador añade el boundary del multipart.
  })

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Has enviado demasiadas candidaturas. Inténtalo más tarde.')
    }
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body?.error?.message ?? body?.message ?? message
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(message)
  }
}

export function useApplyToOffer(uuid: string) {
  return useMutation({
    mutationFn: (input: ApplicationInput) => submitApplication(uuid, input),
  })
}
