import Link from 'next/link'

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <header className="border-b border-border-subtle bg-surface-raised">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/offers" className="font-bold text-lg text-text-primary">
            OpenATS
          </Link>
          <Link
            href="/backoffice/login"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Acceso recruiters
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
