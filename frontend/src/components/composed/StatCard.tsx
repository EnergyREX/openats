import { LucideIcon } from 'lucide-react'
import Card from '@/components/primitives/Card'
import Skeleton from '@/components/primitives/Skeleton'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value?: number | string
  isLoading?: boolean
  error?: string
}

export default function StatCard({ icon: Icon, label, value, isLoading, error }: StatCardProps) {
  return (
    <Card className="group p-5 bg-surface-raised hover:border-border-strong flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          {label}
        </span>
        <Icon size={16} className="text-interactive shrink-0" />
      </div>

      {isLoading ? (
        <Skeleton height="2.5rem" className="w-20" />
      ) : error ? (
        <span className="text-sm text-emissive">{error}</span>
      ) : (
        <span className="font-display text-4xl leading-none text-text-primary tabular-nums">
          {value}
        </span>
      )}
    </Card>
  )
}
