'use client'

interface FilterSkeletonProps {
  size?: 'large' | 'small'
  count?: number
}

export default function FilterSkeleton({ size = 'large', count = 4 }: FilterSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`filter-chip-skeleton ${size === 'large' ? 'filter-chip-skeleton-large' : 'filter-chip-skeleton-small'}`}
        />
      ))}
    </>
  )
}

