'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Wallet, CheckCircle2 } from 'lucide-react'
import { usePublicOffer } from '@/lib/api/public'
import { formatLocation, formatSalary } from '@/lib/format'
import { Display, Heading, Body } from '@/components/primitives/Typography'
import Card from '@/components/primitives/Card'
import Skeleton from '@/components/primitives/Skeleton'
import ApplicationForm from '@/components/composed/ApplicationForm'

export default function OfferDetailPage() {
  const params = useParams<{ uuid: string }>()
  const uuid = params.uuid
  const offer = usePublicOffer(uuid)

  return (
    <div>
      <Link
        href="/offers"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Volver a ofertas
      </Link>

      {offer.isPending && (
        <div className="space-y-4">
          <Skeleton height="2.5rem" className="w-2/3" />
          <Skeleton height="1rem" className="w-1/3" />
          <Skeleton height="12rem" className="w-full" />
        </div>
      )}

      {offer.isError && (
        <Card className="p-8 bg-surface-raised text-center">
          <Body className="text-emissive">{offer.error.message}</Body>
        </Card>
      )}

      {offer.isSuccess && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          {/* Detalle */}
          <article>
            <Display>{offer.data.title}</Display>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
              {offer.data.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={15} />
                  {offer.data.company.name}
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
                </span>
              )}
            </div>

            <div className="mt-6 whitespace-pre-line text-text-secondary leading-7">
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
          </article>

          {/* Formulario de candidatura */}
          <Card className="p-6 bg-surface-raised lg:sticky lg:top-6">
            <ApplicationForm offerUuid={uuid} />
          </Card>
        </div>
      )}
    </div>
  )
}
