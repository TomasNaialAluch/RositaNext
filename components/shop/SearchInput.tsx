'use client'

import { HiMagnifyingGlass } from 'react-icons/hi2'
import '@/styles/tienda.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Buscar productos...' }: SearchInputProps) {
  return (
    <div className="tienda-search-container">
      <HiMagnifyingGlass className="tienda-search-icon" />
      <input
        type="text"
        className="tienda-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

