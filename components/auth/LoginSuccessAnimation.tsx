'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoginSuccessAnimationProps {
  onComplete: () => void
}

export default function LoginSuccessAnimation({ onComplete }: LoginSuccessAnimationProps) {
  const [stage, setStage] = useState<'black' | 'transition' | 'pink' | 'shrink' | 'exit'>('black')

  useEffect(() => {
    // Etapa 1: Mostrar rosa negra con "Login exitoso" (1 segundo)
    const timer1 = setTimeout(() => {
      setStage('transition')
    }, 1000)

    // Etapa 2: Transición de negra a rosa (1 segundo) - ambas visibles durante la transición
    const timer2 = setTimeout(() => {
      setStage('pink')
    }, 2000)

    // Etapa 3: Mantener rosa visible y ocultar texto (0.3 segundos)
    const timer3 = setTimeout(() => {
      setStage('shrink')
    }, 2300)

    // Etapa 4: Achicar y subir (2 segundos - más lento)
    const timer4 = setTimeout(() => {
      setStage('exit')
    }, 4500)

    // Etapa 5: Completar animación (después de que desaparece)
    const timer5 = setTimeout(() => {
      onComplete()
    }, 5500)

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
            width={300} 
            height={300}
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
            width={300} 
            height={300}
            priority
            unoptimized
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
            className={`logo-pink ${stage === 'transition' || stage === 'pink' ? 'fade-in' : ''} ${stage === 'shrink' || stage === 'exit' ? 'shrink-up' : ''}`}
          />
        </div>

        {/* Texto "Login exitoso" */}
        <div className={`login-success-text ${stage === 'black' || stage === 'transition' || stage === 'pink' ? 'visible' : 'hidden'}`}>
          Login exitoso
        </div>
      </div>
    </div>
  )
}

