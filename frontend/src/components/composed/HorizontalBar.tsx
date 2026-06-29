'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import Popover from '../primitives/Popover'
import Button from '../primitives/Button'

/** Etiquetas legibles por segmento de ruta. Fallback: capitaliza el slug. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  jobs: 'Empleos',
  candidates: 'Candidatos',
  new: 'Nueva oferta',
}

function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const HorizontalBar = () => {
  const pathname = usePathname()

  // '/backoffice/jobs/new' -> ['backoffice', 'jobs', 'new']
  const segments = pathname.split('/').filter(Boolean)
  // El prefijo 'backoffice' es chrome, no se muestra como crumb.
  const start = segments[0] === 'backoffice' ? 1 : 0

  const crumbs = segments.slice(start).map((segment, i) => {
    const absoluteIdx = start + i
    return {
      label: labelFor(segment),
      href: '/' + segments.slice(0, absoluteIdx + 1).join('/'),
      isLast: absoluteIdx === segments.length - 1,
    }
  })

  // La sección de empleos ya expone su propio CTA de "Nueva oferta".
  const hideQuickAction = pathname.startsWith('/backoffice/jobs')

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-subtle bg-surface-base/80 px-8 py-3 backdrop-blur">
      {/* Breadcrumb */}
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
            {crumb.isLast ? (
              <span className="truncate font-medium text-text-primary">{crumb.label}</span>
            ) : (
              <>
                <Link
                  href={crumb.href}
                  className="truncate text-text-muted transition-colors hover:text-text-primary"
                >
                  {crumb.label}
                </Link>
                <ChevronRight size={14} className="shrink-0 text-text-muted" />
              </>
            )}
          </li>
        ))}
      </ol>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-2">
        {!hideQuickAction && (
          <Link href="/backoffice/jobs/new">
            <Button className="gap-1.5">
              <Plus size={16} />
              Nueva oferta
            </Button>
          </Link>
        )}
        <Popover />
      </div>
    </nav>
  )
}

export default HorizontalBar
