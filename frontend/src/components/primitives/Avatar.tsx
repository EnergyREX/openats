import React from 'react'
import { Avatar as BAvatar } from '@base-ui/react'

interface props extends React.ComponentPropsWithoutRef<'img'> {
    imgSrc: string
    fallbackTXT: string
}

const Avatar = ({ imgSrc, fallbackTXT, className }: props) => {
  return (
    <BAvatar.Root className="
    inline-flex size-12 items-center justify-center overflow-hidden rounded-full bg-interactive/15 align-middle text-base font-medium text-interactive select-none">
        <BAvatar.Image
            src={imgSrc}
            width="48"
            height="48"
            className={`size-full object-cover ${className}`}    
        />
        <BAvatar.Fallback 
            delay={600}
            className={`flex size-full items-center justify-center text-base`}
        >
            {fallbackTXT}
        </BAvatar.Fallback>
    </BAvatar.Root>
  )
}

export default Avatar