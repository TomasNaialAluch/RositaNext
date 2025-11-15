'use client'

import { useState } from 'react'

type AdminSection = 'products' | 'users' | 'orders' | 'settings'

interface NavItem {
  id: AdminSection
  label: string
  path: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'products', label: 'Productos', path: '/admin/products' },
  { id: 'users', label: 'Usuarios', path: '/admin/users', disabled: true },
  { id: 'orders', label: 'Pedidos', path: '/admin/orders', disabled: true },
  { id: 'settings', label: 'Configuración', path: '/admin/settings', disabled: true }
]

export default function AdminNavigation() {
  const [activeSection, setActiveSection] = useState<AdminSection>('products')

  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return
    setActiveSection(item.id)
    // En el futuro aquí se puede agregar navegación con router.push(item.path)
  }

  return (
    <nav className="admin-navigation">
      <ul className="admin-nav-list">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`admin-nav-item ${activeSection === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => handleNavClick(item)}
              disabled={item.disabled}
            >
              {item.label}
              {item.disabled && <span className="admin-nav-badge">Próximamente</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

