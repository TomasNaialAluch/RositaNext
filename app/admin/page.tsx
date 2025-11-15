'use client'

import { useState } from 'react'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductManagement from '@/components/admin/sections/ProductManagement'
import '@/styles/admin.css'

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  return (
    <AdminAuthGuard onAuthSuccess={setUserEmail}>
      <AdminLayout userEmail={userEmail}>
        <ProductManagement />
      </AdminLayout>
    </AdminAuthGuard>
  )
}

