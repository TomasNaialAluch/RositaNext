'use client'

import Image from 'next/image'

interface AuthLogoProps {
  isShrunk?: boolean
  isStatic?: boolean
  size?: number
}

export default function AuthLogo({ isShrunk = false, isStatic = false, size = 300 }: AuthLogoProps) {
  if (isStatic) {
    return (
      <div className="logo-container logo-up-static">
        <Image 
          src="/images/logo-negro.png" 
          alt="Rosita" 
          width={size} 
          height={size}
          priority
          unoptimized
          style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
          className="logo-image logo-shrink"
        />
      </div>
    )
  }

  return (
    <div className={`logo-container ${isShrunk ? 'logo-up' : ''}`}>
      <Image 
        src="/images/logo-negro.png" 
        alt="Rosita" 
        width={size} 
        height={size}
        priority
        unoptimized
        style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
        className={`logo-image ${isShrunk ? 'logo-shrink' : 'logo-grow'}`}
      />
    </div>
  )
}

