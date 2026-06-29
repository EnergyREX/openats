import React from 'react'
import { Input as BI } from '@base-ui/react'

const Input = ({ className, ...props }: React.ComponentPropsWithoutRef<'input'>) => {
  return (
    <BI
      className={`py-2 px-3 text-sm rounded-md border border-border-default bg-surface-base
        text-text-primary placeholder:text-text-muted
        focus:outline-none focus:ring-2 focus:ring-interactive ${className ?? ''}`}
      {...props}
    />
  )
}

export default Input
