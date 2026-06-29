'use client'

import { Briefcase, Users, FileText, Clock, Inbox, AlertCircle } from 'lucide-react'
import { useStats, useOffers } from '@/lib/api/queries'
import { Heading, Eyebrow } from '@/components/primitives/Typography'
import Card from '@/components/primitives/Card'
import Skeleton from '@/components/primitives/Skeleton'
import StatCard from '@/components/composed/StatCard'

const STAT_CARDS = [
  { key: 'totalJobs' as const, label: 'Empleos Activos', icon: Briefcase },
  { key: 'totalCandidates' as const, label: 'Candidatos', icon: Users },
  { key: 'totalApplications' as const, label: 'Postulaciones', icon: FileText },
  { key: 'pendingReview' as const, label: 'Pendiente Revisión', icon: Clock },
]

export default function DashboardPage() {
  const stats = useStats()
  const offers = useOffers()

  return (
    <div className="p-8">
      <header className="mb-8">
        <Eyebrow>Panel del recruiter</Eyebrow>
        <Heading className="mt-2 text-3xl">Dashboard</Heading>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            isLoading={stats.isPending}
            error={stats.isError ? stats.error.message : undefined}
            value={stats.isSuccess ? stats.data[card.key] : undefined}
          />
        ))}
      </div>

      <Card className="bg-surface-raised overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <Heading className="text-lg">Ofertas Activas</Heading>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-border-subtle">
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Título</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Recruiter</th>
              <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide text-right">Candidatos</th>
            </tr>
          </thead>
          <tbody>
            {offers.isPending &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle">
                  <td className="px-5 py-4"><Skeleton height="1rem" className="w-48" /></td>
                  <td className="px-5 py-4"><Skeleton height="1rem" className="w-32" /></td>
                  <td className="px-5 py-4 flex justify-end"><Skeleton height="1rem" className="w-8" /></td>
                </tr>
              ))}

            {offers.isError && (
              <tr>
                <td colSpan={3} className="px-5 py-14">
                  <div className="flex flex-col items-center text-center gap-2">
                    <AlertCircle size={22} className="text-text-muted" />
                    <p className="font-display text-base text-text-primary">
                      No se pudieron cargar las ofertas
                    </p>
                    <p className="font-mono text-xs text-text-muted">{offers.error.message}</p>
                  </div>
                </td>
              </tr>
            )}

            {offers.isSuccess && offers.data.offers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-14">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Inbox size={22} className="text-text-muted" />
                    <p className="font-display text-base text-text-primary">
                      Aún no hay ofertas activas
                    </p>
                    <p className="font-sans text-sm text-text-muted">
                      Crea tu primera oferta para empezar a recibir candidaturas.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {offers.isSuccess &&
              offers.data.offers.map((offer) => (
                <tr key={offer.uuid} className="border-b border-border-subtle hover:bg-surface-overlay transition-colors">
                  <td className="px-5 py-4 text-text-primary font-medium">{offer.title}</td>
                  <td className="px-5 py-4 text-text-secondary">{offer.recruiterName ?? '—'}</td>
                  <td className="px-5 py-4 text-text-secondary text-right">{offer.applicationCount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
