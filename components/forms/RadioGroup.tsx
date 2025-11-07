'use client'

interface RadioGroupProps {
  name: string
  value: 'casa' | 'departamento'
  onChange: (value: 'casa' | 'departamento') => void
}

export default function RadioGroup({ name, value, onChange }: RadioGroupProps) {
  return (
    <div className="radio-group">
      <label className="radio-label">
        <input
          type="radio"
          name={name}
          value="casa"
          checked={value === 'casa'}
          onChange={(e) => onChange(e.target.value as 'casa' | 'departamento')}
          className="radio-input"
        />
        <span>Casa</span>
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name={name}
          value="departamento"
          checked={value === 'departamento'}
          onChange={(e) => onChange(e.target.value as 'casa' | 'departamento')}
          className="radio-input"
        />
        <span>Departamento</span>
      </label>
    </div>
  )
}


