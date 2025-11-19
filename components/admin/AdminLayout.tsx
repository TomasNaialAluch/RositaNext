'use client'

import { ReactNode } from 'react'
import AdminNavigation from './AdminNavigation'
import type { AdminSection } from './types'
import '@/styles/admin.css'

interface AdminLayoutProps {
  children: ReactNode
  userEmail: string | null
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export default function AdminLayout({ children, userEmail, activeSection, onSectionChange }: AdminLayoutProps) {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <p className="admin-user">Usuario: {userEmail}</p>
        </header>
        
        <AdminNavigation activeSection={activeSection} onSectionChange={onSectionChange} />
        
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}







