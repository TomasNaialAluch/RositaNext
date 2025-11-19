export type AdminSection = 'products' | 'edit-products' | 'order-products' | 'users' | 'orders' | 'settings'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  pricePerKg: number
  image?: string
  category: 'vacuno' | 'cerdo' | 'pollo' | 'otros'
  unitType?: 'kg' | 'unidad'
  minQuantity?: number
  avgUnitWeight?: number | null
  cutOptions?: string[]
  preparation?: string[] | null
  order?: number // Orden de prioridad para mostrar productos
  [key: string]: any
}

export interface ProductFormData {
  name: string
  description: string
  category: string
  pricePerKg: number
  unitType: 'kg' | 'unidad'
  minQuantity?: number
  avgUnitWeight?: number
  cutOptions: string[]
  preparation: string[]
  image: File | null
}

