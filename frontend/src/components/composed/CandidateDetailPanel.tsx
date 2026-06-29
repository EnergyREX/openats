'use client'

import { useState, type ReactNode } from 'react'
import { Dialog } from '@base-ui/react'
import {
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  GitBranch,
  Link2,
  FileText,
  Download,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Languages as LanguagesIcon,
  Heart,
  Info,
  ChevronsRight,
  CircleCheck,
  CircleX,
  LogOut,
} from 'lucide-react'
import { downloadCandidateCv, type CandidacyStatus, type OfferCandidacy } from '@/lib/api'
import {
  useCandidate,
  useAdvanceCandidacy,
  useHireCandidacy,
  useRejectCandidacy,
  useWithdrawCandidacy,
} from '@/lib/api/queries'
import Button from '@/components/primitives/Button'
import Skeleton from '@/components/primitives/Skeleton'

const TERMINAL_STATUSES = new Set<CandidacyStatus>(['hired', 'rejected', 'withdrawn'])

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

const ANNOTATION_STYLES: Record<'positive' | 'negative' | 'neutral', string> = {
  positive: 'border-l-interactive',
  negative: 'border-l-emissive',
  neutral: 'border-l-border-strong',
}

function scoreColor(score: number): string {
  if (score < 0) return 'text-text-muted'
  if (score >= 75) return 'text-interactive'
  if (score >= 50) return 'text-emissive'
  return 'text-text-muted'
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-interactive mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}

function ContactRow({ icon, value, href }: { icon: ReactNode; value: string | null; href?: string }) {
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

interface Props {
  offerUuid: string
  candidacy: OfferCandidacy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  onError: (message: string) => void
}

export default function CandidateDetailPanel({
  offerUuid,
  candidacy,
  open,
  onOpenChange,
  candidateName,
  onError,
}: Props) {
  const candidate = useCandidate(candidacy?.candidateUuid ?? '')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [cvDownloading, setCvDownloading] = useState(false)

  // Reinicia el formulario de rechazo al cambiar de candidatura (ajuste de
  // estado durante el render, el patrón recomendado frente a un efecto).
  const [prevUuid, setPrevUuid] = useState(candidacy?.uuid)
  if (candidacy?.uuid !== prevUuid) {
    setPrevUuid(candidacy?.uuid)
    setRejecting(false)
    setReason('')
  }

  const advance = useAdvanceCandidacy(offerUuid)
  const hire = useHireCandidacy(offerUuid)
  const reject = useRejectCandidacy(offerUuid)
  const withdraw = useWithdrawCandidacy(offerUuid)

  if (!candidacy) return null

  const status = candidacy.status
  const isTerminal = TERMINAL_STATUSES.has(status)
  const canAdvance = !isTerminal && status !== 'offer'
  const canHire = status === 'offer'
  const pending = advance.isPending || hire.isPending || reject.isPending || withdraw.isPending

  const fail = (err: unknown) =>
    onError(err instanceof Error ? err.message : 'No se pudo completar la acción')

  const runAdvance = () => advance.mutate(candidacy.uuid, { onError: fail })
  const runHire = () => hire.mutate(candidacy.uuid, { onError: fail })
  const runWithdraw = () => withdraw.mutate(candidacy.uuid, { onError: fail })
  const submitReject = () => {
    if (!reason.trim()) return
    reject.mutate(
      { candidacyUuid: candidacy.uuid, reason: reason.trim() },
      {
        onSuccess: () => { setRejecting(false); setReason('') },
        onError: fail,
      },
    )
  }

  const c = candidate.data

  const handleDownloadCv = async () => {
    setCvDownloading(true)
    try {
      const safeName = (c?.name ?? candidateName).trim().replace(/\s+/g, '-').toLowerCase()
      await downloadCandidateCv(candidacy.candidateUuid, `cv-${safeName}.pdf`)
    } catch (err) {
      fail(err)
    } finally {
      setCvDownloading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 max-h-[75vh] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto scrollbar-themed rounded-xl border border-border-subtle bg-surface-base shadow-2xl outline-none transition-all duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {/* Cabecera */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-subtle bg-surface-base/95 px-6 py-5 backdrop-blur">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-interactive/15">
                <span className="text-sm font-bold text-interactive">
                  {getInitials(c?.name ?? candidateName)}
                </span>
              </div>
              <div className="min-w-0">
                <Dialog.Title className="font-display text-xl text-text-primary truncate">
                  {c?.name ?? candidateName}
                </Dialog.Title>
                <p className="text-sm text-text-muted truncate">{c?.title ?? '—'}</p>
              </div>
            </div>
            <Dialog.Close
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary"
              aria-label="Cerrar"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="px-6 pb-8">
            {/* Estado de la candidatura + acciones */}
            <div className="mt-5 rounded-xl border border-border-subtle bg-surface-raised p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="text-sm text-text-muted">
                    Score{' '}
                    <span className={`font-semibold tabular-nums ${scoreColor(candidacy.score)}`}>
                      {candidacy.score >= 0 ? candidacy.score : '—'}
                    </span>
                  </span>
                </div>
              </div>

              {isTerminal ? (
                <p className="mt-3 text-sm text-text-muted">
                  Esta candidatura está en un estado final y no admite más cambios.
                </p>
              ) : rejecting ? (
                <div className="mt-4">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Motivo del rechazo…"
                    className="w-full resize-y rounded-md border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-interactive"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => { setRejecting(false); setReason('') }}>
                      Cancelar
                    </Button>
                    <Button type="button" variant="emissive" onClick={submitReject} disabled={!reason.trim() || reject.isPending}>
                      {reject.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canAdvance && (
                    <Button type="button" variant="secondary" onClick={runAdvance} disabled={pending} className="gap-1.5">
                      <ChevronsRight size={15} />
                      Avanzar de fase
                    </Button>
                  )}
                  {canHire && (
                    <Button type="button" onClick={runHire} disabled={pending} className="gap-1.5">
                      <CircleCheck size={15} />
                      Contratar
                    </Button>
                  )}
                  <Button type="button" variant="ghost" onClick={runWithdraw} disabled={pending} className="gap-1.5">
                    <LogOut size={15} />
                    Retirar
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setRejecting(true)} disabled={pending} className="gap-1.5 text-emissive hover:text-emissive">
                    <CircleX size={15} />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>

            {/* Cuerpo del perfil */}
            {candidate.isPending && (
              <div className="mt-6 space-y-3">
                <Skeleton height="1rem" className="w-1/3" />
                <Skeleton height="4rem" className="w-full" />
                <Skeleton height="1rem" className="w-1/4" />
                <Skeleton height="3rem" className="w-full" />
              </div>
            )}

            {candidate.isError && (
              <p className="mt-6 text-sm text-text-muted">
                No se pudo cargar el perfil completo: {candidate.error.message}
              </p>
            )}

            {c && (
              <>
                {/* Contacto */}
                <Section icon={<Mail size={13} />} title="Contacto">
                  <div className="space-y-2">
                    <ContactRow icon={<Mail size={15} />} value={c.contactDetails.email} href={c.contactDetails.email ? `mailto:${c.contactDetails.email}` : undefined} />
                    <ContactRow icon={<Phone size={15} />} value={c.contactDetails.phoneNumber} />
                    <ContactRow icon={<MapPin size={15} />} value={c.contactDetails.address} />
                    <ContactRow icon={<Globe size={15} />} value={c.contactDetails.website} href={c.contactDetails.website ?? undefined} />
                    <ContactRow icon={<GitBranch size={15} />} value={c.contactDetails.github} href={c.contactDetails.github ?? undefined} />
                    <ContactRow icon={<Link2 size={15} />} value={c.contactDetails.linkedin} href={c.contactDetails.linkedin ?? undefined} />
                  </div>
                  {c.cvUrl &&
                    (/^https?:\/\//.test(c.cvUrl) ? (
                      <a
                        href={c.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-interactive hover:underline"
                      >
                        <FileText size={15} />
                        Ver CV
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDownloadCv}
                        disabled={cvDownloading}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-surface-overlay hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download size={15} />
                        {cvDownloading ? 'Descargando…' : 'Descargar CV'}
                      </button>
                    ))}
                </Section>

                {/* Sobre */}
                {c.about && (
                  <Section icon={<Info size={13} />} title="Sobre">
                    <p className="whitespace-pre-line text-sm leading-6 text-text-secondary">{c.about}</p>
                  </Section>
                )}

                {/* Skills */}
                {c.skills.length > 0 && (
                  <Section icon={<Award size={13} />} title="Skills">
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.map((s) => (
                        <span key={s} className="rounded-full border border-border-subtle bg-surface-overlay px-2.5 py-0.5 text-xs text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Experiencia */}
                {c.experience.length > 0 && (
                  <Section icon={<Briefcase size={13} />} title="Experiencia">
                    <div className="space-y-4">
                      {c.experience.map((e, i) => (
                        <div key={i} className="border-l-2 border-border-subtle pl-3.5">
                          <p className="text-sm font-medium text-text-primary">{e.role}</p>
                          <p className="text-xs text-text-muted">
                            {e.company}{e.location ? ` · ${e.location}` : ''} · {e.duration}
                          </p>
                          {e.responsibilities.length > 0 && (
                            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-text-secondary">
                              {e.responsibilities.map((r, j) => <li key={j}>{r}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Educación */}
                {c.education.length > 0 && (
                  <Section icon={<GraduationCap size={13} />} title="Educación">
                    <div className="space-y-3">
                      {c.education.map((e, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium text-text-primary">{e.title}</p>
                          <p className="text-xs text-text-muted">
                            {e.institution} · {e.duration}{e.gpa ? ` · GPA ${e.gpa}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Proyectos */}
                {c.projects.length > 0 && (
                  <Section icon={<FolderGit2 size={13} />} title="Proyectos">
                    <div className="space-y-3">
                      {c.projects.map((p, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium text-text-primary">{p.title}</p>
                          {p.description && <p className="text-sm text-text-secondary">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Certificaciones */}
                {c.certifications.length > 0 && (
                  <Section icon={<Award size={13} />} title="Certificaciones">
                    <div className="space-y-3">
                      {c.certifications.map((e, i) => (
                        <div key={i}>
                          <p className="text-sm font-medium text-text-primary">{e.title}</p>
                          <p className="text-xs text-text-muted">{e.institution} · {e.duration}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Idiomas */}
                {c.languages.length > 0 && (
                  <Section icon={<LanguagesIcon size={13} />} title="Idiomas">
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                      {c.languages.map((l, i) => (
                        <span key={i} className="text-sm text-text-secondary">
                          {l.language} <span className="text-text-muted">· {l.level}</span>
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Voluntariado */}
                {c.volunteering && (
                  <Section icon={<Heart size={13} />} title="Voluntariado">
                    <p className="text-sm font-medium text-text-primary">{c.volunteering.role}</p>
                    <p className="text-xs text-text-muted">{c.volunteering.organization} · {c.volunteering.duration}</p>
                    {c.volunteering.description && <p className="mt-1 text-sm text-text-secondary">{c.volunteering.description}</p>}
                  </Section>
                )}

                {/* Información adicional */}
                {c.additionalInfo && (
                  <Section icon={<Info size={13} />} title={c.additionalInfo.title || 'Información adicional'}>
                    <p className="whitespace-pre-line text-sm leading-6 text-text-secondary">{c.additionalInfo.description}</p>
                  </Section>
                )}
              </>
            )}

            {/* Evaluación de la candidatura */}
            {candidacy.annotations.length > 0 && (
              <Section icon={<Info size={13} />} title="Anotaciones de la evaluación">
                <div className="space-y-2">
                  {candidacy.annotations.map((a, i) => (
                    <p key={i} className={`border-l-2 ${ANNOTATION_STYLES[a.type]} pl-3 text-sm text-text-secondary`}>
                      {a.body}
                    </p>
                  ))}
                </div>
              </Section>
            )}

            {status === 'rejected' && candidacy.rejectionReason && (
              <Section icon={<CircleX size={13} />} title="Motivo de rechazo">
                <p className="text-sm text-text-secondary">{candidacy.rejectionReason}</p>
              </Section>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
