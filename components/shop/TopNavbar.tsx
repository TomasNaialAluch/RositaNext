'use client'

import Image from 'next/image'

interface TopNavbarProps {
  stage: 'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'
  isInitialLoad?: boolean
}

export default function TopNavbar({ stage, isInitialLoad = false }: TopNavbarProps) {
  return (
    <nav className={`top-navbar ${stage} ${isInitialLoad ? 'initial-load' : 'quick-transition'}`}>
      <div className="top-navbar-wrapper">
        <Image 
          src="/images/logo-simple.png" 
          alt="Rosita" 
          width={30} 
          height={30}
          priority
          unoptimized
          className="top-navbar-logo"
        />
      </div>
    </nav>
  )
}

