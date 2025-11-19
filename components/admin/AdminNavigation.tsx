'use client'

import type { AdminSection } from './types'

interface NavItem {
  id: AdminSection
  label: string
  path: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'products', label: 'Agregar Productos', path: '/admin/products' },
  { id: 'edit-products', label: 'Editar Productos', path: '/admin/edit-products' },
  { id: 'order-products', label: 'Orden de Productos', path: '/admin/order-products' },
  { id: 'users', label: 'Usuarios', path: '/admin/users', disabled: true },
  { id: 'orders', label: 'Pedidos', path: '/admin/orders', disabled: false },
  { id: 'settings', label: 'Configuración', path: '/admin/settings', disabled: true }
]

interface AdminNavigationProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export default function AdminNavigation({ activeSection, onSectionChange }: AdminNavigationProps) {
  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return
    onSectionChange(item.id)
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
              type="button"
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

