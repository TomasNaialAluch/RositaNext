'use client'

import { useState } from 'react'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductManagement from '@/components/admin/sections/ProductManagement'
import ProductEditManagement from '@/components/admin/sections/ProductEditManagement'
import ProductOrderManagement from '@/components/admin/sections/ProductOrderManagement'
import OrderManagement from '@/components/admin/sections/OrderManagement'
import type { AdminSection } from '@/components/admin/types'
import '@/styles/admin.css'

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<AdminSection>('products')

  const renderSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManagement />
      case 'edit-products':
        return <ProductEditManagement />
      case 'order-products':
        return <ProductOrderManagement />
      case 'orders':
        return <OrderManagement />
      default:
        return <ProductManagement />
    }
  }

  return (
    <AdminAuthGuard onAuthSuccess={setUserEmail}>
      <AdminLayout 
        userEmail={userEmail}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderSection()}
      </AdminLayout>
    </AdminAuthGuard>
  )
}

