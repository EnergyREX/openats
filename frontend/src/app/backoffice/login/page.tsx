'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/primitives/Button"
import Input from "@/components/primitives/Input"
import Label from "@/components/primitives/Label"
import { Body, Heading, Eyebrow, Display } from "@/components/primitives/Typography"
import { login } from "@/lib/api/auth"

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setError(null)

    const result = await login({ email: email.trim(), password })

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/backoffice/dashboard')
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Panel de marca — editorial, grano orgánico */}
      <aside className="hidden lg:flex flex-col justify-between grain relative overflow-hidden border-r border-border-subtle bg-surface-raised p-12">
        <span className="font-display text-xl tracking-tight text-text-primary">
          Open<span className="text-interactive">ATS</span>
          <span className="text-emissive">.</span>
        </span>

        <div className="max-w-md">
          <Eyebrow>ATS open source · con IA</Eyebrow>
          <Display className="mt-5 text-4xl">
            Contrata mejor,{' '}
            <span className="italic text-interactive">sin fricción.</span>
          </Display>
          <Body className="mt-5 text-sm">
            Candidatos evaluados automáticamente, pipeline bajo control, datos en
            tu propia infraestructura.
          </Body>
        </div>

        <p className="font-mono text-xs text-text-muted">© OpenATS — self-hosted</p>
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-border-emissive/40 to-transparent" />
      </aside>

      {/* Panel de formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <header className="lg:hidden mb-8">
            <span className="font-display text-2xl tracking-tight text-text-primary">
              Open<span className="text-interactive">ATS</span>
              <span className="text-emissive">.</span>
            </span>
          </header>

          <Eyebrow>Acceso recruiters</Eyebrow>
          <Heading className="mt-2 text-2xl">Bienvenido de nuevo</Heading>
          <Body className="mt-1 text-sm">
            Introduce tus credenciales para continuar.
          </Body>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label className="font-medium text-sm">Email
                <Input
                  className='font-normal w-full mt-1.5'
                  type='email'
                  placeholder='example@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Label>
            </div>

            <div>
              <Label className="font-medium text-sm">Password
                <Input
                  className='font-normal w-full mt-1.5'
                  type='password'
                  placeholder='••••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Label>
            </div>

            {error && (
              <p className="text-emissive text-sm font-sans">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-text-muted font-sans">
            ¿Has olvidado tu contraseña?{' '}
            <span className="text-interactive hover:underline cursor-pointer">Recupérala aquí</span>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
