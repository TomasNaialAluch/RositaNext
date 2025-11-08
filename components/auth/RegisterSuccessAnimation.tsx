'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface RegisterSuccessAnimationProps {
  onComplete: () => void
}

export default function RegisterSuccessAnimation({ onComplete }: RegisterSuccessAnimationProps) {
  const [stage, setStage] = useState<'black' | 'transition' | 'pink' | 'shrink' | 'exit'>('black')

  useEffect(() => {
    // Etapa 1: Mostrar rosa negra (0.5 segundos)
    const timer1 = setTimeout(() => {
      setStage('transition')
    }, 500)

    // Etapa 2: Transición de negra a rosa (1 segundo)
    const timer2 = setTimeout(() => {
      setStage('pink')
    }, 1500)

    // Etapa 3: Mantener rosa visible (0.3 segundos)
    const timer3 = setTimeout(() => {
      setStage('shrink')
    }, 1800)

    // Etapa 4: Achicar y subir (2 segundos)
    const timer4 = setTimeout(() => {
      setStage('exit')
    }, 3800)

    // Etapa 5: Completar animación
    const timer5 = setTimeout(() => {
      onComplete()
    }, 4800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [onComplete])

  return (
    <div className="login-success-animation">
      <div className={`login-success-content ${stage}`}>
        {/* Rosa negra */}
        <div className={`logo-black-container ${stage === 'black' || stage === 'transition' ? 'visible' : 'hidden'}`}>
          <Image 
            src="/images/logo-negro.png" 
            alt="Rosita" 
            width={220} 
            height={220}
            priority
            unoptimized
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
            className={`logo-black ${stage === 'transition' ? 'fade-out' : ''}`}
          />
        </div>

        {/* Rosa rosa */}
        <div className={`logo-pink-container ${stage === 'transition' || stage === 'pink' || stage === 'shrink' || stage === 'exit' ? 'visible' : 'hidden'}`}>
          <Image 
            src="/images/logo-sin-fondo.png" 
            alt="Rosita" 
            width={220} 
            height={220}
            priority
            unoptimized
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
            className={`logo-pink ${stage === 'transition' || stage === 'pink' ? 'fade-in' : ''} ${stage === 'shrink' || stage === 'exit' ? 'shrink-up' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}

