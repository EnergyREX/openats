import React, { ReactNode } from 'react'

interface props extends React.ComponentPropsWithRef<'label'> {
    children: ReactNode
}

const Label = ({ children, className, ...props }: props ) => {
  return (
    <label className={`flex flex-col items-start gap-1 text-sm font-bold ${className ?? ''}`} {...props}>{children}</label>
  )
}

export default Label