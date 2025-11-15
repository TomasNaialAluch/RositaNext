'use client'

import { ReactNode } from 'react'
import AdminNavigation from './AdminNavigation'
import '@/styles/admin.css'

interface AdminLayoutProps {
  children: ReactNode
  userEmail: string | null
}

export default function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <p className="admin-user">Usuario: {userEmail}</p>
        </header>
        
        <AdminNavigation />
        
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}





