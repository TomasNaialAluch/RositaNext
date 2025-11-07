'use client'

interface BackButtonProps {
  onClick: () => void
  isClosing?: boolean
  isStatic?: boolean
}

export default function BackButton({ onClick, isClosing = false, isStatic = false }: BackButtonProps) {
  return (
    <button 
      type="button" 
      className={`btn-back ${isStatic ? 'btn-back-static' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={onClick}
      aria-label="Volver atrás"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="#BF5065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}


