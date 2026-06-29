'use client'

import Link from 'next/link'
import { Building2, MapPin, Wallet } from 'lucide-react'
import { usePublicOffers } from '@/lib/api/public'
import { formatLocation, formatSalary } from '@/lib/format'
import { Display, Body, Heading } from '@/components/primitives/Typography'
import Card from '@/components/primitives/Card'
import Skeleton from '@/components/primitives/Skeleton'

export default function OffersPage() {
  const offers = usePublicOffers()

  return (
    <div>
      <div className="mb-8">
        <Display>Ofertas de empleo</Display>
        <Body className="mt-2 text-text-muted">
          Explora nuestras posiciones abiertas y envía tu candidatura.
        </Body>
      </div>

      {offers.isPending && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 bg-surface-raised space-y-3">
              <Skeleton height="1.25rem" className="w-2/3" />
              <Skeleton height="0.875rem" className="w-1/2" />
              <Skeleton height="3rem" className="w-full" />
            </Card>
          ))}
        </div>
      )}

      {offers.isError && (
        <Card className="p-8 bg-surface-raised text-center">
          <Body className="text-emissive">{offers.error.message}</Body>
        </Card>
      )}

      {offers.isSuccess && offers.data.offers.length === 0 && (
        <Card className="p-12 bg-surface-raised text-center">
          <Body className="text-text-muted">No hay ofertas abiertas en este momento.</Body>
        </Card>
      )}

      {offers.isSuccess && offers.data.offers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.data.offers.map((offer) => {
            const location = formatLocation(offer.location)
            const salary = formatSalary(offer.salary)
            return (
              <Link key={offer.uuid} href={`/offers/${offer.uuid}`} className="group">
                <Card className="p-5 bg-surface-raised h-full flex flex-col gap-3 transition-colors group-hover:border-interactive">
                  <div>
                    <Heading className="text-lg group-hover:text-interactive transition-colors">
                      {offer.title}
                    </Heading>
                    {offer.company && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-text-muted mt-1">
                        <Building2 size={14} />
                        {offer.company.name}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-text-secondary line-clamp-3">{offer.body}</p>

                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    {location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {location}
                      </span>
                    )}
                    {salary && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet size={13} />
                        {salary}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
