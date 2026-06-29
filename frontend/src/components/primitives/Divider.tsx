import React from 'react'
import { Separator } from '@base-ui/react'

interface props extends React.ComponentPropsWithoutRef<'div'> {
  orientation: "horizontal" | "vertical"
}

const Divider = ({ orientation, className, ...props }: props) => {
  
  const classes: Record<string, string> = {
    "horizontal": `h-px w-full bg-border-default m-1`,
    "vertical": `w-px h-full bg-border-default m-1`
  }

  return (
    <Separator className={`${classes[orientation]} ${className ?? ''}`} orientation={orientation ?? "horizontal"} {...props} />
  )
}

export default Divider