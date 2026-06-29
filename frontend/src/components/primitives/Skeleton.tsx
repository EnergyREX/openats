import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

const Skeleton = ({ className, width, height, rounded = false }: SkeletonProps) => (
  <div
    className={`animate-pulse bg-surface-overlay ${rounded ? 'rounded-full' : 'rounded-md'} ${className ?? ''}`}
    style={{ width, height }}
    aria-hidden="true"
  />
)

export default Skeleton
