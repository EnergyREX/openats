'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { useCreateOffer } from '@/lib/api/queries'
import Button from '@/components/primitives/Button'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import Card from '@/components/primitives/Card'
import { Heading, Eyebrow } from '@/components/primitives/Typography'

interface FormState {
  title: string
  body: string
  companyName: string
  companyIndustry: string
  companySize: string
  companyWebsite: string
  city: string
  country: string
  modality: string
  salaryMin: string
  salaryMax: string
  currency: string
  period: string
  equity: boolean
  contactEmail: string
  contactPhone: string
}

const EMPTY_FORM: FormState = {
  title: '',
  body: '',
  companyName: '',
  companyIndustry: '',
  companySize: '',
  companyWebsite: '',
  city: '',
  country: '',
  modality: 'onsite',
  salaryMin: '',
  salaryMax: '',
  currency: 'EUR',
  period: 'year',
  equity: false,
  contactEmail: '',
  contactPhone: '',
}

/** Texto de etiqueta con el asterisco de obligatoriedad alineado en la misma línea. */
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      {required && <span className="text-emissive">*</span>}
    </span>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-interactive">
      {children}
    </h3>
  )
}

const fieldClasses =
  'mt-1 w-full px-3 py-2 border border-border-default rounded-md bg-surface-base text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-interactive'

export default function NewJobPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [requirements, setRequirements] = useState<string[]>([])
  const [reqInput, setReqInput] = useState('')
  const createOffer = useCreateOffer()

  const setField = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const addRequirement = () => {
    const value = reqInput.trim()
    if (value && !requirements.includes(value)) {
      setRequirements((prev) => [...prev, value])
    }
    setReqInput('')
  }

  const removeRequirement = (value: string) =>
    setRequirements((prev) => prev.filter((r) => r !== value))

  const onReqKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addRequirement()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim() || !form.companyName.trim()) return

    createOffer.mutate(
      {
        title: form.title.trim(),
        body: form.body.trim(),
        company: {
          name: form.companyName.trim(),
          industry: form.companyIndustry.trim(),
          size: form.companySize.trim(),
          website: form.companyWebsite.trim(),
        },
        location: {
          city: form.city.trim(),
          country: form.country.trim(),
          modality: form.modality,
        },
        salary: {
          min: Number(form.salaryMin) || 0,
          max: Number(form.salaryMax) || 0,
          currency: form.currency,
          period: form.period,
          equity: form.equity,
        },
        contactDetails: {
          email: form.contactEmail.trim() || undefined,
          phoneNumber: form.contactPhone.trim() || undefined,
        },
        requirements,
      },
      {
        onSuccess: () => router.push('/backoffice/jobs'),
      },
    )
  }

  const error = createOffer.isError ? createOffer.error.message : null

  return (
    <div className="p-8">
      <Link
        href="/backoffice/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Volver a empleos
      </Link>

      <header className="mb-8">
        <Eyebrow>Publicar empleo</Eyebrow>
        <Heading className="mt-2 text-3xl">Nueva Oferta</Heading>
      </header>

      <form onSubmit={handleSubmit}>
        <Card className="bg-surface-raised p-6 space-y-6">
          {/* Puesto */}
          <div className="space-y-4">
            <SectionTitle>Puesto</SectionTitle>

            <Label htmlFor="title">
              <FieldLabel required>Título</FieldLabel>
              <Input
                id="title"
                placeholder="Ej. Senior Backend Engineer"
                value={form.title}
                onChange={setField('title')}
                required
                className="mt-1 w-full"
              />
            </Label>

            <Label htmlFor="body">
              <FieldLabel required>Descripción</FieldLabel>
              <textarea
                id="body"
                placeholder="Describe el puesto, responsabilidades y requisitos..."
                value={form.body}
                onChange={setField('body')}
                required
                rows={6}
                className={`${fieldClasses} resize-y`}
              />
            </Label>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <SectionTitle>Empresa</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Label htmlFor="companyName">
                <FieldLabel required>Nombre</FieldLabel>
                <Input
                  id="companyName"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={setField('companyName')}
                  required
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="companyIndustry">
                <FieldLabel>Industria</FieldLabel>
                <Input
                  id="companyIndustry"
                  placeholder="Software"
                  value={form.companyIndustry}
                  onChange={setField('companyIndustry')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="companySize">
                <FieldLabel>Tamaño</FieldLabel>
                <Input
                  id="companySize"
                  placeholder="11-50 empleados"
                  value={form.companySize}
                  onChange={setField('companySize')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="companyWebsite">
                <FieldLabel>Web</FieldLabel>
                <Input
                  id="companyWebsite"
                  placeholder="https://acme.com"
                  value={form.companyWebsite}
                  onChange={setField('companyWebsite')}
                  className="mt-1 w-full"
                />
              </Label>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <SectionTitle>Ubicación</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Label htmlFor="city">
                <FieldLabel>Ciudad</FieldLabel>
                <Input
                  id="city"
                  placeholder="Madrid"
                  value={form.city}
                  onChange={setField('city')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="country">
                <FieldLabel>País</FieldLabel>
                <Input
                  id="country"
                  placeholder="España"
                  value={form.country}
                  onChange={setField('country')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="modality">
                <FieldLabel>Modalidad</FieldLabel>
                <select
                  id="modality"
                  value={form.modality}
                  onChange={setField('modality')}
                  className={fieldClasses}
                >
                  <option value="onsite">Presencial</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="remote">Remoto</option>
                </select>
              </Label>
            </div>
          </div>

          {/* Salario */}
          <div className="space-y-4">
            <SectionTitle>Salario</SectionTitle>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Label htmlFor="salaryMin">
                <FieldLabel>Mínimo</FieldLabel>
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  placeholder="30000"
                  value={form.salaryMin}
                  onChange={setField('salaryMin')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="salaryMax">
                <FieldLabel>Máximo</FieldLabel>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  placeholder="45000"
                  value={form.salaryMax}
                  onChange={setField('salaryMax')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="currency">
                <FieldLabel>Moneda</FieldLabel>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={setField('currency')}
                  className={fieldClasses}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </Label>
              <Label htmlFor="period">
                <FieldLabel>Periodo</FieldLabel>
                <select
                  id="period"
                  value={form.period}
                  onChange={setField('period')}
                  className={fieldClasses}
                >
                  <option value="year">Anual</option>
                  <option value="month">Mensual</option>
                  <option value="hour">Por hora</option>
                </select>
              </Label>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.equity}
                onChange={(e) => setForm((prev) => ({ ...prev, equity: e.target.checked }))}
                className="size-4 accent-interactive"
              />
              Incluye equity / participaciones
            </label>
          </div>

          {/* Requisitos */}
          <div className="space-y-2">
            <SectionTitle>Requisitos</SectionTitle>

            <div className="flex gap-2">
              <Input
                placeholder="Añade un requisito y pulsa Enter"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={onReqKeyDown}
                className="w-full"
              />
              <Button type="button" variant="secondary" onClick={addRequirement}>
                Añadir
              </Button>
            </div>

            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {requirements.map((req) => (
                  <span
                    key={req}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-surface-overlay text-text-secondary border border-border-subtle"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(req)}
                      className="text-text-muted hover:text-emissive transition-colors"
                      aria-label={`Quitar ${req}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <SectionTitle>Contacto</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Label htmlFor="contactEmail">
                <FieldLabel>Email</FieldLabel>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="rrhh@acme.com"
                  value={form.contactEmail}
                  onChange={setField('contactEmail')}
                  className="mt-1 w-full"
                />
              </Label>
              <Label htmlFor="contactPhone">
                <FieldLabel>Teléfono</FieldLabel>
                <Input
                  id="contactPhone"
                  placeholder="+34 600 000 000"
                  value={form.contactPhone}
                  onChange={setField('contactPhone')}
                  className="mt-1 w-full"
                />
              </Label>
            </div>
          </div>

          {error && <p className="text-sm text-emissive">{error}</p>}
        </Card>

        <div className="flex justify-end gap-3 mt-5">
          <Link href="/backoffice/jobs">
            <Button type="button" variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={createOffer.isPending}>
            {createOffer.isPending ? 'Creando...' : 'Crear Oferta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
