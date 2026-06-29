/**
 * Cliente HTTP del backoffice.
 *
 * Devuelve siempre un `ApiResult<T>` (nunca lanza por errores HTTP) para que los
 * consumidores decidan cómo tratarlos. Las `queryFn` de TanStack Query usan el
 * helper `unwrap` para convertir un fallo en una excepción y que React Query
 * gestione el estado de error de forma idiomática.
 *
 * Auth: adjunta `Authorization: Bearer <accessToken>` desde localStorage y, ante
 * un 401, intenta refrescar el token una vez (la cookie httpOnly `refreshToken`
 * viaja gracias a `credentials: 'include'`) y reintenta la petición original.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6500'

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

// ---------- Tipos de respuesta (contrato con el backend) ----------

export interface StatsResponse {
  totalJobs: number
  totalCandidates: number
  totalApplications: number
  pendingReview: number
}

export interface OfferPipeline {
  sourced: number
  screening: number
  interviewing: number
  offer: number
  hired: number
}

export interface OfferSummary {
  uuid: string
  title: string
  recruiterName: string | null
  company: { name: string; industry: string }
  location: { city: string; country: string; modality: string }
  applicationCount: number
  pipeline: OfferPipeline
}

export interface OffersResponse {
  offers: OfferSummary[]
}

export interface OfferDetail {
  uuid: string
  ownerUuid: string
  title: string
  body: string
  company: { name: string; size: string; website: string; industry: string }
  location: { city: string; country: string; modality: string }
  salary: { min: number; max: number; currency: string; period: string; equity: boolean }
  contactDetails: {
    phoneNumber: string
    address: string
    email: string
    website: string
    github: string
    linkedin: string
  }
  requirements: string[]
}

export type CandidacyStatus =
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export interface OfferCandidacy {
  uuid: string
  offerUuid: string
  candidateUuid: string
  status: CandidacyStatus
  currentPhaseOrder: number
  score: number
  annotations: { type: 'positive' | 'negative' | 'neutral'; body: string }[]
  rejectionReason: string
  createdAt: string
  updatedAt: string
}

export interface OfferCandidaciesResponse {
  candidacies: OfferCandidacy[]
}

export type CandidateStatus = 'review' | 'interview' | 'discarded'

export interface CandidateSummary {
  uuid: string
  name: string
  title: string
  email: string | null
  skills: string[]
  applicationCount: number
  topScore: number | null
  topStatus: CandidateStatus | null
}

export interface CandidatesResponse {
  candidates: CandidateSummary[]
}

export interface WorkExperience {
  company: string
  location?: string
  role: string
  duration: string
  responsibilities: string[]
}

export interface CandidateProfile {
  uuid: string
  name: string
  title: string
  about: string
  contactDetails: {
    email: string | null
    phoneNumber: string | null
    address: string | null
    website: string | null
    github: string | null
    linkedin: string | null
  }
  skills: string[]
  experience: WorkExperience[]
  projects: { title: string; description?: string }[]
  education: { title: string; institution: string; duration: string; gpa?: string }[]
  certifications: { title: string; institution: string; duration: string }[]
  languages: { language: string; level: string }[]
  volunteering: { organization: string; role: string; duration: string; description?: string } | null
  additionalInfo: { title: string; description: string } | null
  cvUrl: string | null
}

// ---------- Internos ----------

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user_email')
}

function buildUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${BASE_URL}/${path}`
}

async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return (
      body?.error?.message ??
      (typeof body?.error === 'string' ? body.error : undefined) ??
      body?.message ??
      `HTTP ${res.status}`
    )
  } catch {
    return `HTTP ${res.status}`
  }
}

// Single-flight: los 401 concurrentes (p. ej. las queries del dashboard)
// comparten una única llamada a /refresh. Sin esto, cada uno dispararía su
// propio refresh y, si el backend rota el refresh token, todos menos el
// primero fallarían cerrando la sesión.
let refreshInFlight: Promise<boolean> | null = null

function tryRefresh(): Promise<boolean> {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl('/api/v1/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    })
    if (!res.ok) return false

    const body = await res.json()
    if (body?.success && body?.token) {
      localStorage.setItem('accessToken', body.token)
      return true
    }
    return false
  } catch {
    return false
  }
}

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<ApiResult<T>> {
  const doFetch = () =>
    fetch(buildUrl(endpoint), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

  try {
    let res = await doFetch()

    if (res.status === 401) {
      const refreshed = await tryRefresh()
      if (refreshed) {
        res = await doFetch()
      } else {
        clearSession()
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.endsWith('/backoffice/login')
        ) {
          window.location.href = '/backoffice/login'
        }
        return { ok: false, error: 'Sesión expirada' }
      }
    }

    if (!res.ok) {
      return { ok: false, error: await extractError(res) }
    }

    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error de red',
    }
  }
}

// ---------- API pública ----------

export const api = {
  get: <T>(endpoint: string): Promise<ApiResult<T>> =>
    request<T>(endpoint, 'GET'),
  post: <T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResult<T>> =>
    request<T>(endpoint, 'POST', body ?? {}),
}

/** Convierte un `ApiResult` en valor o excepción. Pensado para `queryFn`/`mutationFn`. */
export function unwrap<T>(result: ApiResult<T>): T {
  if (!result.ok) throw new Error(result.error)
  return result.data
}

/** Extrae el nombre de fichero de una cabecera `Content-Disposition`. */
function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1])
    } catch {
      /* cae al filename ascii */
    }
  }
  const ascii = /filename="?([^"]+)"?/i.exec(header)
  return ascii ? ascii[1] : null
}

/**
 * Descarga el CV del candidato como blob y dispara la descarga en el navegador.
 * No usa `<a href>` porque el endpoint exige `Authorization`; replica el flujo de
 * token + refresh del cliente JSON.
 */
export async function downloadCandidateCv(uuid: string, fallbackName = 'cv'): Promise<void> {
  const url = buildUrl(`/api/v1/candidates/${encodeURIComponent(uuid)}/cv`)
  const doFetch = () =>
    fetch(url, {
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      credentials: 'include',
    })

  let res = await doFetch()
  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      res = await doFetch()
    } else {
      clearSession()
      throw new Error('Sesión expirada')
    }
  }

  if (!res.ok) throw new Error(await extractError(res))

  const blob = await res.blob()
  const filename = filenameFromDisposition(res.headers.get('Content-Disposition')) ?? fallbackName

  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
