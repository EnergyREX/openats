import React, { ReactNode } from 'react'
import { Button as BB } from '@base-ui/react/button';

type Variant = 'primary' | 'secondary' | 'ghost' | 'emissive'

interface props extends React.ComponentPropsWithoutRef<'button'> {
    children: ReactNode
    variant?: Variant
}

const base = `group hover:cursor-pointer inline-flex items-center justify-center gap-2 h-10 px-4 m-0
    rounded-lg text-sm font-medium leading-6 select-none
    transition-[background-color,border-color,color,transform] duration-150
    active:translate-y-px
    focus-visible:outline-2 focus-visible:outline-interactive focus-visible:outline-offset-2
    data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:active:translate-y-0`

const variants: Record<Variant, string> = {
  primary: `border border-interactive bg-interactive text-text-inverse
    hover:bg-interactive-hover hover:border-interactive-hover
    active:bg-interactive-muted active:border-interactive-muted`,
  emissive: `border border-emissive bg-emissive text-neutral-950
    hover:bg-emissive-glow hover:border-emissive-glow
    shadow-[0_0_0_0_var(--color-emissive)] hover:shadow-[0_6px_22px_-8px_var(--color-emissive)]`,
  secondary: `border border-border-default bg-surface-raised text-text-primary
    hover:bg-surface-overlay hover:border-border-strong active:bg-surface-overlay/70`,
  ghost: `border border-transparent bg-transparent text-text-secondary
    hover:bg-surface-overlay hover:text-text-primary active:bg-surface-overlay/70`,
}

const Button = ({ children, className, variant = 'primary', ...props }: props) => {
  return (
    <BB
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}>
        {children}
    </BB>
  )
}

export default Button
