'use client'

import { useState } from 'react'
import type { CandidateSummary } from '@/lib/api'
import { useCandidates } from '@/lib/api/queries'
import { Heading, Eyebrow } from '@/components/primitives/Typography'
import Card from '@/components/primitives/Card'
import Input from '@/components/primitives/Input'
import Skeleton from '@/components/primitives/Skeleton'
import { Search, Users, AlertCircle } from 'lucide-react'

type StatusFilter = 'all' | 'review' | 'interview' | 'discarded'

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'review', label: 'En revisión' },
  { key: 'interview', label: 'Entrevista' },
  { key: 'discarded', label: 'Descartado' },
]

const STATUS_LABELS: Record<string, string> = {
  review: 'En revisión',
  interview: 'Entrevista',
  discarded: 'Descartado',
}

const STATUS_STYLES: Record<string, string> = {
  review: 'bg-emissive/15 text-emissive',
  interview: 'bg-interactive/15 text-interactive',
  discarded: 'bg-surface-overlay text-text-muted',
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-text-muted'
  if (score >= 75) return 'text-interactive'
  if (score >= 50) return 'text-emissive'
  return 'text-text-muted'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function CandidatesPage() {
  const candidates = useCandidates()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const allCandidates = candidates.isSuccess ? candidates.data.candidates : []

  const filtered = allCandidates.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false)
    const matchesStatus =
      statusFilter === 'all' || c.topStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <Eyebrow>Talento en cartera</Eyebrow>
        <div className="mt-2 flex items-baseline gap-3">
          <Heading className="text-3xl">Candidatos</Heading>
          {candidates.isSuccess && (
            <span className="text-sm text-text-muted tabular-nums">
              {allCandidates.length} en total
            </span>
          )}
        </div>
      </header>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre, cargo o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 bg-surface-raised"
          />
        </div>

        <div className="flex gap-1 p-1 bg-surface-raised border border-border-subtle rounded-md self-start">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                statusFilter === f.key
                  ? 'bg-surface-overlay text-text-primary font-medium'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-surface-raised border-border-default overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle text-left">
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Candidato</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden md:table-cell">Email</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden lg:table-cell">Skills</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide text-center">Aplicaciones</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide text-center">Score</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {candidates.isPending &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton width="2rem" height="2rem" rounded />
                      <div className="space-y-1.5">
                        <Skeleton height="0.875rem" className="w-32" />
                        <Skeleton height="0.75rem" className="w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell"><Skeleton height="0.875rem" className="w-36" /></td>
                  <td className="px-5 py-4 hidden lg:table-cell"><Skeleton height="0.875rem" className="w-40" /></td>
                  <td className="px-5 py-4 text-center"><Skeleton height="0.875rem" className="w-6 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Skeleton height="0.875rem" className="w-8 mx-auto" /></td>
                  <td className="px-5 py-4"><Skeleton height="1.5rem" className="w-24 rounded-full" /></td>
                </tr>
              ))}

            {/* Error */}
            {candidates.isError && (
              <tr>
                <td colSpan={6} className="px-5 py-14">
                  <div className="flex flex-col items-center text-center gap-2">
                    <AlertCircle size={22} className="text-text-muted" />
                    <p className="font-display text-base text-text-primary">
                      No se pudieron cargar los candidatos
                    </p>
                    <p className="font-mono text-xs text-text-muted">{candidates.error.message}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {candidates.isSuccess && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Users size={24} className="text-text-muted" />
                    <p className="font-display text-base text-text-primary">
                      {search || statusFilter !== 'all'
                        ? 'Sin coincidencias'
                        : 'Todavía no hay candidatos'}
                    </p>
                    <p className="font-sans text-sm text-text-muted">
                      {search || statusFilter !== 'all'
                        ? 'Ningún candidato coincide con los filtros aplicados.'
                        : 'Los candidatos aparecerán aquí al recibir postulaciones.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {candidates.isSuccess &&
              filtered.map((c: CandidateSummary) => (
                <tr
                  key={c.uuid}
                  className="border-b border-border-subtle hover:bg-surface-overlay transition-colors"
                >
                  {/* Candidato */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-interactive/15 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-interactive">
                          {getInitials(c.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                        <p className="text-xs text-text-muted truncate">{c.title}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-text-secondary">{c.email ?? '—'}</span>
                  </td>

                  {/* Skills */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs rounded-full bg-surface-overlay text-text-secondary border border-border-subtle"
                        >
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded-full text-text-muted">
                          +{c.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Aplicaciones */}
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm text-text-secondary">{c.applicationCount}</span>
                  </td>

                  {/* Score */}
                  <td className="px-5 py-4 text-center">
                    <span className={`text-sm font-semibold tabular-nums ${scoreColor(c.topScore)}`}>
                      {c.topScore !== null ? c.topScore : '—'}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    {c.topStatus ? (
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[c.topStatus]}`}
                      >
                        {STATUS_LABELS[c.topStatus]}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Sin evaluar</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
