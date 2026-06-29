'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useApplyToOffer } from '@/lib/api/public'
import Button from '@/components/primitives/Button'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import { Body, Heading } from '@/components/primitives/Typography'

interface ApplicationFormProps {
  offerUuid: string
}

interface FormState {
  name: string
  email: string
  phoneNum: string
  website: string
}

const EMPTY_FORM: FormState = { name: '', email: '', phoneNum: '', website: '' }

export default function ApplicationForm({ offerUuid }: ApplicationFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [cv, setCv] = useState<File | null>(null)
  const apply = useApplyToOffer(offerUuid)

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !cv) return

    apply.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phoneNum: form.phoneNum.trim() || undefined,
      website: form.website.trim() || undefined,
      cv,
    })
  }

  if (apply.isSuccess) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8">
        <CheckCircle2 size={40} className="text-interactive" />
        <Heading className="font-display text-2xl">¡Candidatura enviada!</Heading>
        <Body className="text-text-muted max-w-xs">
          Hemos recibido tu CV. Lo revisaremos y nos pondremos en contacto contigo.
        </Body>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Heading className="text-lg">Aplicar a esta oferta</Heading>

      <Label htmlFor="name">
        <span className="flex items-center gap-1">Nombre completo <span className="text-emissive">*</span></span>
        <Input
          id="name"
          placeholder="Ana García"
          value={form.name}
          onChange={handleChange('name')}
          required
          className="mt-1 w-full"
        />
      </Label>

      <Label htmlFor="email">
        <span className="flex items-center gap-1">Email <span className="text-emissive">*</span></span>
        <Input
          id="email"
          type="email"
          placeholder="ana@email.com"
          value={form.email}
          onChange={handleChange('email')}
          required
          className="mt-1 w-full"
        />
      </Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Label htmlFor="phoneNum">
          Teléfono
          <Input
            id="phoneNum"
            placeholder="+34 600 000 000"
            value={form.phoneNum}
            onChange={handleChange('phoneNum')}
            className="mt-1 w-full"
          />
        </Label>
        <Label htmlFor="website">
          Web / Portfolio
          <Input
            id="website"
            placeholder="https://..."
            value={form.website}
            onChange={handleChange('website')}
            className="mt-1 w-full"
          />
        </Label>
      </div>

      <Label htmlFor="cv">
        <span className="flex items-center gap-1">CV (PDF) <span className="text-emissive">*</span></span>
        <input
          id="cv"
          type="file"
          accept="application/pdf"
          onChange={(e) => setCv(e.target.files?.[0] ?? null)}
          required
          className="mt-1 w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-overlay file:px-3 file:py-2 file:text-sm file:text-text-primary hover:file:bg-surface-raised"
        />
      </Label>

      {apply.isError && (
        <p className="text-sm text-emissive">{apply.error.message}</p>
      )}

      <Button type="submit" disabled={apply.isPending} className="w-full">
        {apply.isPending ? 'Enviando...' : 'Enviar candidatura'}
      </Button>
    </form>
  )
}
