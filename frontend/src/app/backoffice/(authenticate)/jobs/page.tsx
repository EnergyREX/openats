'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { OfferSummary, OfferPipeline } from '@/lib/api'
import { useOffers } from '@/lib/api/queries'
import { Heading, Eyebrow } from '@/components/primitives/Typography'
import Button from '@/components/primitives/Button'
import Card from '@/components/primitives/Card'
import Skeleton from '@/components/primitives/Skeleton'
import { Plus, Users, Inbox, AlertCircle, Briefcase, MapPin } from 'lucide-react'

// Fases del pipeline alineadas con los estados de candidatura del dominio.
const STAGES: { key: keyof OfferPipeline; label: string; bar: string }[] = [
  { key: 'sourced', label: 'SOUR', bar: 'bg-slate-400' },
  { key: 'screening', label: 'SCRE', bar: 'bg-blue-400' },
  { key: 'interviewing', label: 'ENTR', bar: 'bg-violet-400' },
  { key: 'offer', label: 'OFER', bar: 'bg-amber-400' },
  { key: 'hired', label: 'HIRE', bar: 'bg-emerald-400' },
]

const MODALITY: Record<string, { label: string; className: string }> = {
  remote: { label: 'REMOTO', className: 'bg-emerald-500/15 text-emerald-400' },
  hybrid: { label: 'HÍBRIDO', className: 'bg-blue-500/15 text-blue-400' },
  onsite: { label: 'PRESENCIAL', className: 'bg-surface-overlay text-text-muted' },
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function PipelineBoard({ pipeline }: { pipeline: OfferPipeline }) {
  return (
    <div className="flex gap-2.5">
      {STAGES.map((stage) => {
        const value = pipeline[stage.key]
        return (
          <div
            key={stage.key}
            className="relative w-[108px] overflow-hidden rounded-lg border border-border-subtle bg-surface-overlay/50 px-4 pb-3.5 pt-3"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{stage.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
            <span
              className={`absolute inset-x-0 bottom-0 h-1 ${stage.bar} ${value === 0 ? 'opacity-25' : ''}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function JobsPage() {
  const offers = useOffers()
  const router = useRouter()

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <header>
          <Eyebrow>Ofertas publicadas</Eyebrow>
          <Heading className="mt-2 text-3xl">Empleos</Heading>
        </header>
        <Link href="/backoffice/jobs/new">
          <Button className="gap-1.5">
            <Plus size={16} />
            Nueva Oferta
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {offers.isPending && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-surface-raised p-5">
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-2">
                  <Skeleton height="1.25rem" className="w-56" />
                  <Skeleton height="0.875rem" className="w-72" />
                </div>
                <Skeleton height="4.25rem" className="w-[580px]" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {offers.isError && (
        <Card className="bg-surface-raised p-14">
          <div className="flex flex-col items-center text-center gap-2">
            <AlertCircle size={22} className="text-text-muted" />
            <p className="font-display text-base text-text-primary">No se pudieron cargar las ofertas</p>
            <p className="font-mono text-xs text-text-muted">{offers.error.message}</p>
          </div>
        </Card>
      )}

      {/* Empty */}
      {offers.isSuccess && offers.data.offers.length === 0 && (
        <Card className="bg-surface-raised p-14">
          <div className="flex flex-col items-center text-center gap-2">
            <Inbox size={22} className="text-text-muted" />
            <p className="font-display text-base text-text-primary">No hay empleos creados todavía</p>
            <p className="font-sans text-sm text-text-muted">Usa el botón «Nueva Oferta» para comenzar.</p>
          </div>
        </Card>
      )}

      {/* Cards */}
      {offers.isSuccess && offers.data.offers.length > 0 && (
        <div className="space-y-3">
          {offers.data.offers.map((offer: OfferSummary) => {
            const modality = MODALITY[offer.location.modality]
            const isHot = offer.applicationCount >= 5
            return (
              <Card
                key={offer.uuid}
                onClick={() => router.push(`/backoffice/jobs/${offer.uuid}`)}
                className="group cursor-pointer bg-surface-raised p-5 hover:border-border-default"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Identidad de la oferta */}
                  <div className="min-w-0 lg:w-[320px] lg:shrink-0">
                    <Link
                      href={`/backoffice/jobs/${offer.uuid}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-text-primary hover:text-interactive transition-colors"
                    >
                      {offer.title}
                    </Link>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-text-muted">
                      {offer.company.industry && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase size={12} />
                          {offer.company.industry}
                        </span>
                      )}
                      {offer.location.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {offer.location.city}
                        </span>
                      )}
                      {modality && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${modality.className}`}>
                          {modality.label}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                      {offer.recruiterName && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-interactive/15 text-[9px] font-bold text-interactive">
                            {getInitials(offer.recruiterName)}
                          </span>
                          {offer.recruiterName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} />
                        {offer.applicationCount} candidatos
                      </span>
                    </div>
                  </div>

                  {/* Pipeline */}
                  <PipelineBoard pipeline={offer.pipeline} />

                  {/* Estado */}
                  <div className="flex items-center gap-3 lg:w-[140px] lg:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isHot ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {isHot ? 'Caliente' : 'Abierta'}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
