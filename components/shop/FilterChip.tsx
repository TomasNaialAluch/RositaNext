'use client'

import '@/styles/tienda.css'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  size?: 'large' | 'small'
}

export default function FilterChip({ label, active, onClick, size = 'large' }: FilterChipProps) {
  return (
    <button
      className={`filter-chip filter-chip-${size} ${active ? 'filter-chip-active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

