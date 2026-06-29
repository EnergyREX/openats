'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Tabs, ScrollArea } from '@base-ui/react'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Wallet,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  GitBranch,
  Link2,
  AlertCircle,
  Inbox,
  X,
  ExternalLink,
} from 'lucide-react'
import type { CandidacyStatus, OfferCandidacy } from '@/lib/api'
import { useOffer, useOfferCandidacies, useCandidates } from '@/lib/api/queries'
import { formatLocation, formatSalary } from '@/lib/format'
import { Heading, Eyebrow, Body } from '@/components/primitives/Typography'
import Card from '@/components/primitives/Card'
import Button from '@/components/primitives/Button'
import Skeleton from '@/components/primitives/Skeleton'
import CandidateDetailPanel from '@/components/composed/CandidateDetailPanel'

const STATUS_LABELS: Record<CandidacyStatus, string> = {
  applied: 'Aplicado',
  screening: 'Cribado',
  interviewing: 'Entrevista',
  offer: 'Oferta',
  hired: 'Contratado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
}

const STATUS_STYLES: Record<CandidacyStatus, string> = {
  applied: 'bg-surface-overlay text-text-secondary',
  screening: 'bg-emissive/15 text-emissive',
  interviewing: 'bg-interactive/15 text-interactive',
  offer: 'bg-interactive/15 text-interactive',
  hired: 'bg-interactive/20 text-interactive',
  rejected: 'bg-surface-overlay text-text-muted',
  withdrawn: 'bg-surface-overlay text-text-muted',
}

const tabClass =
  'relative -mb-px cursor-pointer border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary focus-visible:outline-none data-active:border-interactive data-active:text-text-primary'

function scoreColor(score: number): string {
  if (score < 0) return 'text-text-muted'
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

// Área de scroll con altura acotada: evita que ofertas largas alarguen la página.
function ScrollPanel({ children }: { children: ReactNode }) {
  return (
    <ScrollArea.Root className="relative">
      <ScrollArea.Viewport className="max-h-[calc(100vh-19rem)] min-h-[12rem] w-full overscroll-contain pr-4">
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="m-0.5 flex w-2 touch-none select-none justify-center rounded-full opacity-0 transition-opacity duration-150 data-hovering:opacity-100 data-scrolling:opacity-100"
      >
        <ScrollArea.Thumb className="w-full rounded-full bg-border-default" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}

function ContactRow({ icon, value, href }: { icon: ReactNode; value: string; href?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
      <span className="text-text-muted shrink-0">{icon}</span>
      {href ? (
        <a href={href} className="truncate hover:text-interactive transition-colors">{value}</a>
      ) : (
        <span className="truncate">{value}</span>
      )}
    </div>
  )
}

export default function JobDetailPage() {
  const params = useParams<{ uuid: string }>()
  const uuid = params.uuid
  const offer = useOffer(uuid)
  const candidacies = useOfferCandidacies(uuid)
  const candidates = useCandidates()
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  // El panel se alimenta del dato vivo de la query (no de una copia), de modo que
  // tras avanzar/contratar/rechazar refleja el nuevo estado sin reabrirlo.
  const selected =
    candidacies.data?.candidacies.find((c) => c.uuid === selectedUuid) ?? null

  const openCandidacy = (c: OfferCandidacy) => {
    setSelectedUuid(c.uuid)
    setPanelOpen(true)
  }

  // Las candidacies sólo traen `candidateUuid`; resolvemos nombre/cargo desde el
  // listado de candidatos del backoffice (cruce en cliente).
  const candidateByUuid = new Map(
    (candidates.data?.candidates ?? []).map((c) => [c.uuid, c]),
  )

  return (
    <div className="p-8">
      <Link
        href="/backoffice/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Volver a empleos
      </Link>

      {offer.isPending && (
        <div className="space-y-4">
          <Skeleton height="1rem" className="w-32" />
          <Skeleton height="2.5rem" className="w-2/3" />
          <Skeleton height="1rem" className="w-1/2" />
          <Skeleton height="12rem" className="w-full" />
        </div>
      )}

      {offer.isError && (
        <Card className="p-8 bg-surface-raised text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle size={22} className="text-text-muted" />
            <Body className="text-text-primary">No se pudo cargar la oferta</Body>
            <p className="font-mono text-xs text-text-muted">{offer.error.message}</p>
          </div>
        </Card>
      )}

      {offer.isSuccess && (
        <div>
          {/* Cabecera */}
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Eyebrow>Oferta</Eyebrow>
              <Heading className="mt-2 text-3xl">{offer.data.title}</Heading>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
                {offer.data.company.name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={15} />
                    {offer.data.company.name}
                    {offer.data.company.industry && ` · ${offer.data.company.industry}`}
                  </span>
                )}
                {formatLocation(offer.data.location) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} />
                    {formatLocation(offer.data.location)}
                  </span>
                )}
                {formatSalary(offer.data.salary) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet size={15} />
                    {formatSalary(offer.data.salary)}
                    {offer.data.salary.equity && ' + equity'}
                  </span>
                )}
              </div>
            </div>

            <Link href={`/offers/${uuid}`} target="_blank" rel="noreferrer" className="shrink-0">
              <Button variant="secondary" className="gap-1.5">
                <ExternalLink size={15} />
                Ver oferta
              </Button>
            </Link>
          </header>

          {actionError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-border-emissive bg-emissive/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-emissive" />
              <p className="flex-1 text-sm text-text-secondary">{actionError}</p>
              <button
                onClick={() => setActionError(null)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Cerrar aviso"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Tabs: datos de la oferta / candidatos */}
          <Tabs.Root defaultValue="oferta" className="mt-6">
            <Tabs.List className="flex items-center gap-1 border-b border-border-subtle">
              <Tabs.Tab value="oferta" className={tabClass}>
                Datos de la oferta
              </Tabs.Tab>
              <Tabs.Tab value="candidatos" className={tabClass}>
                <span className="inline-flex items-center gap-2">
                  Candidatos
                  {candidacies.isSuccess && (
                    <span className="rounded-full bg-surface-overlay px-1.5 py-0.5 text-xs tabular-nums text-text-secondary">
                      {candidacies.data.candidacies.length}
                    </span>
                  )}
                </span>
              </Tabs.Tab>
            </Tabs.List>

            {/* Panel: datos de la oferta */}
            <Tabs.Panel value="oferta" className="pt-5 focus-visible:outline-none">
              <ScrollPanel>
                <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
                  <div className="min-w-0">
                    <div className="whitespace-pre-line text-text-secondary leading-7">
                      {offer.data.body}
                    </div>

                    {offer.data.requirements.length > 0 && (
                      <section className="mt-8">
                        <Heading className="text-lg mb-3">Requisitos</Heading>
                        <ul className="space-y-2">
                          {offer.data.requirements.map((req) => (
                            <li key={req} className="flex items-start gap-2 text-text-secondary">
                              <CheckCircle2 size={16} className="mt-1 shrink-0 text-interactive" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <Card className="bg-surface-raised p-5">
                      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-interactive mb-4">
                        Contacto
                      </h3>
                      <div className="space-y-3">
                        <ContactRow icon={<Mail size={15} />} value={offer.data.contactDetails.email} href={offer.data.contactDetails.email ? `mailto:${offer.data.contactDetails.email}` : undefined} />
                        <ContactRow icon={<Phone size={15} />} value={offer.data.contactDetails.phoneNumber} />
                        <ContactRow icon={<Globe size={15} />} value={offer.data.contactDetails.website} href={offer.data.contactDetails.website || undefined} />
                        <ContactRow icon={<GitBranch size={15} />} value={offer.data.contactDetails.github} href={offer.data.contactDetails.github || undefined} />
                        <ContactRow icon={<Link2 size={15} />} value={offer.data.contactDetails.linkedin} href={offer.data.contactDetails.linkedin || undefined} />
                        {!offer.data.contactDetails.email &&
                          !offer.data.contactDetails.phoneNumber &&
                          !offer.data.contactDetails.website &&
                          !offer.data.contactDetails.github &&
                          !offer.data.contactDetails.linkedin && (
                            <p className="text-sm text-text-muted">Sin datos de contacto.</p>
                          )}
                      </div>
                    </Card>

                    {offer.data.company.name && (
                      <Card className="bg-surface-raised p-5">
                        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-interactive mb-4">
                          Empresa
                        </h3>
                        <div className="space-y-1.5 text-sm">
                          <p className="text-text-primary font-medium">{offer.data.company.name}</p>
                          {offer.data.company.industry && <p className="text-text-secondary">{offer.data.company.industry}</p>}
                          {offer.data.company.size && <p className="text-text-muted">{offer.data.company.size}</p>}
                          {offer.data.company.website && (
                            <a href={offer.data.company.website} className="inline-flex items-center gap-1.5 text-interactive hover:underline">
                              <Globe size={13} />
                              Web
                            </a>
                          )}
                        </div>
                      </Card>
                    )}
                  </aside>
                </div>
              </ScrollPanel>
            </Tabs.Panel>

            {/* Panel: candidatos */}
            <Tabs.Panel value="candidatos" className="pt-5 focus-visible:outline-none">
              <ScrollPanel>
                <Card className="bg-surface-raised overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="sticky top-0 z-10 border-b border-border-subtle bg-surface-raised text-left">
                        <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Candidato</th>
                        <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide text-center">Score</th>
                        <th className="px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidacies.isPending &&
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-border-subtle">
                            <td className="px-5 py-4"><Skeleton height="1rem" className="w-40" /></td>
                            <td className="px-5 py-4 text-center"><Skeleton height="1rem" className="w-8 mx-auto" /></td>
                            <td className="px-5 py-4"><Skeleton height="1.5rem" className="w-24 rounded-full" /></td>
                          </tr>
                        ))}

                      {candidacies.isError && (
                        <tr>
                          <td colSpan={3} className="px-5 py-10">
                            <div className="flex flex-col items-center text-center gap-2">
                              <AlertCircle size={20} className="text-text-muted" />
                              <p className="font-mono text-xs text-text-muted">{candidacies.error.message}</p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {candidacies.isSuccess && candidacies.data.candidacies.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-12">
                            <div className="flex flex-col items-center text-center gap-2">
                              <Inbox size={20} className="text-text-muted" />
                              <p className="font-display text-base text-text-primary">
                                Todavía no hay candidatos
                              </p>
                              <p className="font-sans text-sm text-text-muted">
                                Las candidaturas a esta oferta aparecerán aquí.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {candidacies.isSuccess &&
                        candidacies.data.candidacies.map((c: OfferCandidacy) => {
                          const candidate = candidateByUuid.get(c.candidateUuid)
                          return (
                            <tr
                              key={c.uuid}
                              className="border-b border-border-subtle hover:bg-surface-overlay transition-colors cursor-pointer"
                              onClick={() => openCandidacy(c)}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-interactive/15 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-interactive">
                                      {getInitials(candidate?.name ?? '?')}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                      {candidate?.name ?? 'Candidato'}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">
                                      {candidate?.title ?? c.candidateUuid}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`text-sm font-semibold tabular-nums ${scoreColor(c.score)}`}>
                                  {c.score >= 0 ? c.score : '—'}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[c.status]}`}>
                                  {STATUS_LABELS[c.status]}
                                </span>
                                {c.status === 'rejected' && c.rejectionReason && (
                                  <p className="mt-1 max-w-[14rem] text-xs text-text-muted truncate" title={c.rejectionReason}>
                                    {c.rejectionReason}
                                  </p>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </Card>
              </ScrollPanel>
            </Tabs.Panel>
          </Tabs.Root>
        </div>
      )}

      <CandidateDetailPanel
        offerUuid={uuid}
        candidacy={selected}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        candidateName={(selected && candidateByUuid.get(selected.candidateUuid)?.name) || 'Candidato'}
        onError={setActionError}
      />
    </div>
  )
}
