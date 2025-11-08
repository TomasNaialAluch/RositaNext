'use client'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

export default function AddressInput({
  value,
  onChange,
  placeholder = 'Dirección',
  label,
  required = false
}: AddressInputProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          className="form-input"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
