import type { PublicOffer } from '@/lib/api/public'

const MODALITY_LABELS: Record<string, string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
}

export function formatLocation(location: PublicOffer['location']): string | null {
  if (!location) return null
  const place = [location.city, location.country].filter(Boolean).join(', ')
  const modality = MODALITY_LABELS[location.modality] ?? location.modality
  return [place, modality].filter(Boolean).join(' · ') || null
}

export function formatSalary(salary: PublicOffer['salary']): string | null {
  if (!salary) return null
  const fmt = (n: number) => new Intl.NumberFormat('es-ES').format(n)
  const range =
    salary.min === salary.max
      ? fmt(salary.min)
      : `${fmt(salary.min)} – ${fmt(salary.max)}`
  return `${range} ${salary.currency}/${salary.period}`
}
