import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Display, Heading, Body, Lead, Eyebrow } from '@/components/primitives/Typography'
import { FEATURECARDS } from '@/constants/FEATURECARDS'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <header className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl tracking-tight text-text-primary">
            Open<span className="text-interactive">ATS</span>
            <span className="text-emissive">.</span>
          </span>
          <nav className="flex items-center gap-7 text-sm font-sans">
            <Link href="/offers" className="text-text-muted hover:text-text-primary transition-colors">
              Ofertas
            </Link>
            <Link
              href="/backoffice/login"
              className="text-text-primary hover:text-interactive transition-colors"
            >
              Acceso recruiters
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO — asimétrico 7/5, con grano orgánico */}
        <section className="grain border-b border-border-subtle overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <Eyebrow className="rise" style={{ animationDelay: '0ms' }}>
                ATS open source · con IA
              </Eyebrow>
              <Display className="mt-5 rise" style={{ animationDelay: '80ms' }}>
                Contrata mejor,{' '}
                <span className="italic text-interactive">sin fricción.</span>
              </Display>
              <Lead className="mt-6 max-w-xl rise" style={{ animationDelay: '160ms' }}>
                Publica ofertas, recibe CVs y obtén candidatos evaluados
                automáticamente. Tú decides; la IA hace el trabajo pesado.
              </Lead>

              <div
                className="mt-9 flex flex-wrap items-center gap-3 rise"
                style={{ animationDelay: '240ms' }}
              >
                <Link
                  href="/offers"
                  className="group inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-interactive text-text-inverse text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-interactive-hover active:translate-y-px"
                >
                  Ver ofertas abiertas
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/backoffice/login"
                  className="inline-flex items-center h-11 px-5 rounded-lg border border-border-default bg-surface-raised text-text-primary text-sm font-medium transition-colors hover:border-border-strong hover:bg-surface-overlay"
                >
                  Entrar al backoffice
                </Link>
              </div>
            </div>

            {/* Ficha de candidato como objeto gráfico editorial */}
            <div className="lg:col-span-5 rise" style={{ animationDelay: '320ms' }}>
              <CandidateCard />
            </div>
          </div>
        </section>

        {/* FEATURES — índice editorial numerado, con filetes */}
        <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <Eyebrow>Cómo funciona</Eyebrow>
          <Heading className="mt-3 text-3xl max-w-lg">
            Tres piezas, cero trabajo manual.
          </Heading>

          <ol className="mt-12 divide-y divide-border-subtle border-y border-border-subtle">
            {FEATURECARDS.map((feature, i) => (
              <li
                key={feature.title}
                className="group grid sm:grid-cols-12 gap-4 sm:gap-8 py-8 items-baseline"
              >
                <div className="sm:col-span-1 font-display text-3xl text-interactive/70 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="sm:col-span-4 flex items-center gap-3">
                  <feature.icon size={18} className="text-emissive shrink-0" />
                  <Heading className="text-xl">{feature.title}</Heading>
                </div>
                <div className="sm:col-span-7">
                  <Body className="text-[15px]">{feature.description}</Body>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-text-muted font-sans">
          <span>OpenATS — open source, licencia en el repositorio</span>
          <Link href="/offers" className="hover:text-interactive transition-colors">
            Explorar ofertas →
          </Link>
        </div>
      </footer>
    </div>
  )
}

/* Mock decorativo + comunicativo: una candidatura evaluada por la IA. */
function CandidateCard() {
  return (
    <div className="relative">
      {/* sombra de capa, da profundidad sin imagen */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-border-subtle" />
      <article className="relative rounded-2xl border border-border-default bg-surface-raised p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
              Screening
            </p>
            <h3 className="font-display text-xl mt-1 text-text-primary">Marina Calvo</h3>
            <p className="font-sans text-sm text-text-secondary">Backend Engineer</p>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl leading-none text-emissive">87</div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-1">
              score
            </p>
          </div>
        </div>

        {/* barra de score */}
        <div className="mt-5 h-1.5 rounded-full bg-surface-overlay overflow-hidden">
          <div className="h-full w-[87%] rounded-full bg-emissive" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Tag tone="positive">+ 5 años Node</Tag>
          <Tag tone="positive">+ DDD / Hexagonal</Tag>
          <Tag tone="neutral">~ Sin Kubernetes</Tag>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
          <span className="font-mono text-[11px] text-text-muted">candidatura #2f9a</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-interactive">
            <span className="size-1.5 rounded-full bg-interactive" />
            En proceso
          </span>
        </div>
      </article>
    </div>
  )
}

function Tag({ children, tone }: { children: React.ReactNode; tone: 'positive' | 'neutral' }) {
  const styles =
    tone === 'positive'
      ? 'border-border-strong text-interactive'
      : 'border-border-subtle text-text-muted'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-sans ${styles}`}>
      {children}
    </span>
  )
}
