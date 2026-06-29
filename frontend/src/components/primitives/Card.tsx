import React, { ReactNode } from 'react'

interface props extends React.ComponentPropsWithoutRef<"div"> {
  children: ReactNode
}

const Card = ({ children, className, ...props }: props) => {
  return (
    <div
      className={`border border-border-subtle rounded-xl transition-colors duration-200 ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
