'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import TopNavbar from '@/components/shop/TopNavbar'
import AddressInput from '@/components/forms/AddressInput'
import FormInput from '@/components/forms/FormInput'
import '@/styles/shop.css'
import '@/styles/checkout.css'

interface CartItem {
  id: string
  name: string
  quantity: number
  unitType: 'kg' | 'unidad'
  price: number
  cutOption?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Datos del usuario
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  
  // Items del carrito (por ahora mock, después se conectará con el contexto)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  
  // Estados de validación
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('shopNavbarAnimated')
    if (hasAnimated) {
      setIsInitialLoad(false)
      setStage('complete')
    } else {
      setIsInitialLoad(true)
      setStage('logo-falling')
      const timer1 = setTimeout(() => setStage('logo-positioned'), 1000)
      const timer2 = setTimeout(() => setStage('navbar-expanding'), 1500)
      const timer3 = setTimeout(() => {
        setStage('complete')
        sessionStorage.setItem('shopNavbarAnimated', 'true')
      }, 2500)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setFullName(currentUser.displayName || '')
        setEmail(currentUser.email || '')
        // TODO: Cargar teléfono y dirección desde Firestore si están guardados
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // TODO: Cargar items del carrito desde el contexto o localStorage
  useEffect(() => {
    // Mock data por ahora
    const mockItems: CartItem[] = [
      {
        id: '1',
        name: 'Asado de Tira',
        quantity: 2,
        unitType: 'kg',
        price: 5500,
        cutOption: 'Milanesa'
      },
      {
        id: '2',
        name: 'Vacío',
        quantity: 1.5,
        unitType: 'kg',
        price: 4800
      }
    ]
    setCartItems(mockItems)
    const total = mockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setCartTotal(total)
  }, [])

  const validateForm = () => {
    const newErrors: { phone?: string; address?: string } = {}
    
    if (!phone.trim()) {
      newErrors.phone = 'El número de teléfono es requerido para la entrega.'
    } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(phone)) {
      newErrors.phone = 'El formato del teléfono no es válido.'
    }
    
    if (!address.trim()) {
      newErrors.address = 'La dirección es requerida para la entrega.'
    } else if (address.trim().length < 5) {
      newErrors.address = 'La dirección debe tener al menos 5 caracteres.'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirmOrder = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: Crear el pedido en Firestore
      console.log('Confirmar pedido:', {
        userId: user?.uid,
        items: cartItems,
        total: cartTotal,
        shipping: {
          fullName,
          email,
          phone,
          address
        }
      })
      
      // Simular delay de creación del pedido
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirigir a página de éxito o pedidos
      router.push('/pedidos')
    } catch (error) {
      console.error('Error al confirmar pedido:', error)
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="shop-page">
        <div className="checkout-loading">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenedor principal */}
      <main className="shop-main-content checkout-main-content">
        <div className="checkout-container">
          {/* Título */}
          <h1 className="checkout-title">Checkout</h1>

          {/* Detalle del pedido */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">Detalle del pedido</h2>
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-info">
                    <h3 className="checkout-item-name">{item.name}</h3>
                    {item.cutOption && (
                      <p className="checkout-item-cut">Corte: {item.cutOption}</p>
                    )}
                    <p className="checkout-item-quantity">
                      {item.quantity} {item.unitType === 'kg' ? 'kg' : 'unidad(es)'}
                    </p>
                  </div>
                  <div className="checkout-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-total">
              <span className="checkout-total-label">Total:</span>
              <span className="checkout-total-amount">{formatPrice(cartTotal)}</span>
            </div>
          </section>

          {/* Datos del usuario */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">Datos de entrega</h2>
            
            <div className="checkout-user-info">
              <div className="checkout-info-item">
                <span className="checkout-info-label">Nombre:</span>
                <span className="checkout-info-value">{fullName || 'No disponible'}</span>
              </div>
              <div className="checkout-info-item">
                <span className="checkout-info-label">Email:</span>
                <span className="checkout-info-value">{email || 'No disponible'}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div className="checkout-form-field">
              <FormInput
                type="tel"
                label="Teléfono *"
                placeholder="Teléfono de contacto"
                value={phone}
                required
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) {
                    setErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.phone
                      return newErrors
                    })
                  }
                }}
              />
              {errors.phone && (
                <div className="checkout-error-message">{errors.phone}</div>
              )}
            </div>

            {/* Dirección */}
            <div className="checkout-form-field">
              <AddressInput
                label="Dirección de entrega *"
                placeholder="Dirección completa"
                value={address}
                required
                onChange={(value) => {
                  setAddress(value)
                  if (errors.address) {
                    setErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.address
                      return newErrors
                    })
                  }
                }}
              />
              {errors.address && (
                <div className="checkout-error-message">{errors.address}</div>
              )}
            </div>
          </section>

          {/* Botón volver a carrito */}
          <div className="checkout-back-section">
            <button
              className="checkout-back-button"
              onClick={() => router.push('/tienda')}
            >
              ← Volver al carrito
            </button>
          </div>
        </div>
      </main>

      {/* Barra inferior con botón confirmar pedido */}
      <div className="checkout-footer">
        <div className="checkout-footer-content">
          <div className="checkout-footer-total">
            <span className="checkout-footer-total-label">Total:</span>
            <span className="checkout-footer-total-amount">{formatPrice(cartTotal)}</span>
          </div>
          <button
            className="checkout-footer-confirm-btn"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

