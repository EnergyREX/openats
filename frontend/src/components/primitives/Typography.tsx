import React, { ReactNode } from 'react'

/**
 * Sistema tipográfico editorial.
 * Display/Heading → serif Playfair (protagonista). Body/Lead → Hanken sans.
 * Eyebrow → antetítulo mono en versalitas, la firma editorial.
 */

interface EyebrowProps extends React.ComponentPropsWithoutRef<'p'> {
  children: ReactNode
}

export const Eyebrow = ({ children, className, ...props }: EyebrowProps) => (
  <p
    className={`font-mono text-xs uppercase tracking-[0.25em] text-interactive ${className ?? ''}`}
    {...props}
  >
    {children}
  </p>
)

interface DisplayProps extends React.ComponentPropsWithoutRef<'h1'> {
  children: ReactNode
}

export const Display = ({ children, className, ...props }: DisplayProps) => (
  <h1
    className={`font-display text-5xl sm:text-6xl font-medium leading-[1.02] tracking-[-0.02em] text-balance text-text-primary ${className ?? ''}`}
    {...props}
  >
    {children}
  </h1>
)

interface HeadingProps extends React.ComponentPropsWithoutRef<'h2'> {
  children: ReactNode
}

export const Heading = ({ children, className, ...props }: HeadingProps) => (
  <h2
    className={`font-display text-2xl font-medium leading-tight tracking-[-0.01em] text-text-primary ${className ?? ''}`}
    {...props}
  >
    {children}
  </h2>
)

interface LeadProps extends React.ComponentPropsWithoutRef<'p'> {
  children: ReactNode
}

export const Lead = ({ children, className, ...props }: LeadProps) => (
  <p
    className={`font-sans text-lg leading-relaxed text-text-secondary text-pretty ${className ?? ''}`}
    {...props}
  >
    {children}
  </p>
)

interface BodyProps extends React.ComponentPropsWithoutRef<'p'> {
  children: ReactNode
}

export const Body = ({ children, className, ...props }: BodyProps) => (
  <p
    className={`font-sans text-base text-text-secondary leading-7 text-pretty ${className ?? ''}`}
    {...props}
  >
    {children}
  </p>
)

interface CodeProps extends React.ComponentPropsWithoutRef<'code'> {
  children: ReactNode
}

export const CodeSM = ({ children, className, ...props }: CodeProps) => (
  <code
    className={`font-mono text-xs bg-surface-overlay text-text-primary px-1.5 py-0.5 rounded ${className ?? ''}`}
    {...props}
  >
    {children}
  </code>
)
