'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useCart } from '@/contexts/CartContext'
import TopNavbar from '@/components/shop/TopNavbar'
import AddressInput from '@/components/forms/AddressInput'
import FormInput from '@/components/forms/FormInput'
import RadioGroup from '@/components/forms/RadioGroup'
import { useAlertModal } from '@/hooks/useAlertModal'
import '@/styles/shop.css'
import '@/styles/checkout.css'

function CheckoutContent() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart } = useCart()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Datos del usuario
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [addressType, setAddressType] = useState<'casa' | 'departamento' | null>(null)
  const [floor, setFloor] = useState('')
  const [doorbell, setDoorbell] = useState('')
  const [userDataLoaded, setUserDataLoaded] = useState(false)
  
  // Estados de validación
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showInfo, AlertModalComponent } = useAlertModal()

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
    if (!auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setFullName(currentUser.displayName || '')
        setEmail(currentUser.email || '')
        
        // Cargar datos adicionales del usuario desde Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Prellenar campos con datos del usuario si existen
            if (userData.phone) {
              setPhone(userData.phone)
            }
            if (userData.address) {
              setAddress(userData.address)
            }
            if (userData.addressType) {
              setAddressType(userData.addressType)
            } else {
              // Si no hay addressType guardado, usar 'casa' por defecto
              setAddressType('casa')
            }
            if (userData.floor) {
              setFloor(userData.floor)
            }
            if (userData.doorbell) {
              setDoorbell(userData.doorbell)
            }
            
            // Si se cargaron datos, mostrar mensaje informativo
            if (userData.phone || userData.address) {
              setUserDataLoaded(true)
              setTimeout(() => {
                showInfo(
                  'Datos cargados',
                  'Hemos cargado tus datos de perfil. Por favor, revísalos y edítalos si es necesario para este pedido.'
                )
              }, 500)
            }
          } else {
            // Si no existe el documento del usuario, establecer valores por defecto
            setAddressType('casa')
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          // En caso de error, establecer valores por defecto
          setAddressType('casa')
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, showInfo])


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

  // Función helper para eliminar valores undefined de un objeto
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null
    }
    if (Array.isArray(obj)) {
      return obj.map(item => removeUndefined(item)).filter(item => item !== null && item !== undefined)
    }
    if (typeof obj === 'object') {
      const cleaned: any = {}
      for (const key in obj) {
        if (obj[key] !== undefined) {
          const cleanedValue = removeUndefined(obj[key])
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue
          }
        }
      }
      return cleaned
    }
    return obj
  }

  const handleConfirmOrder = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Crear el pedido en Firestore
      if (db && user) {
        // Limpiar items del carrito eliminando valores undefined
        const cleanedItems = cartItems.map(item => {
          const cleanedItem: any = {
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unitType: item.unitType
          }
          if (item.cutOption) cleanedItem.cutOption = item.cutOption
          if (item.image) cleanedItem.image = item.image
          if (item.avgUnitWeight !== undefined && item.avgUnitWeight !== null) {
            cleanedItem.avgUnitWeight = item.avgUnitWeight
          }
          return cleanedItem
        })

        // Limpiar shipping eliminando valores undefined
        const cleanedShipping: any = {
          fullName: fullName || '',
          email: email || '',
          phone: phone || '',
          address: address || ''
        }
        if (addressType) cleanedShipping.addressType = addressType
        if (floor) cleanedShipping.floor = floor
        if (doorbell) cleanedShipping.doorbell = doorbell

        const orderData = {
          userId: user.uid,
          items: cleanedItems,
          total: cartTotal,
          shipping: cleanedShipping,
          status: 'pending',
          createdAt: serverTimestamp()
        }
        
        // Limpiar todo el objeto de valores undefined
        const cleanedOrderData = removeUndefined(orderData)
        
        console.log('Guardando pedido en Firebase:', cleanedOrderData)
        const docRef = await addDoc(collection(db, 'orders'), cleanedOrderData)
        console.log('Pedido guardado con ID:', docRef.id)
      } else {
        console.error('No hay db o user:', { db: !!db, user: !!user })
      }
      
      // Limpiar carrito SOLO después de confirmar el pedido exitosamente
      await clearCart()
      
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

          {/* Mensaje sobre comunicación por WhatsApp */}
          <div style={{
            backgroundColor: '#e7f3ff',
            border: '1px solid #2196F3',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📱</span>
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: '#1565C0',
                marginBottom: '0.25rem'
              }}>
                Comunicación por WhatsApp
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#1565C0',
                lineHeight: '1.5'
              }}>
                Después de confirmar tu pedido, nos comunicaremos contigo por WhatsApp para coordinar el pedido y el día de entrega.
              </p>
            </div>
          </div>

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
            
            {/* Mensaje informativo si se cargaron datos */}
            {userDataLoaded && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#856404',
                    marginBottom: '0.25rem'
                  }}>
                    Datos cargados desde tu perfil
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#856404',
                    lineHeight: '1.5'
                  }}>
                    Hemos cargado tus datos guardados. Por favor, revísalos y edítalos si es necesario para este pedido.
                  </p>
                </div>
              </div>
            )}
            
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

            {/* Tipo de vivienda */}
            {addressType !== null && (
              <div className="checkout-form-field">
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: '#0C0D0E'
                }}>
                  Tipo de vivienda
                </label>
                <RadioGroup
                  name="checkout_address_type"
                  value={addressType}
                  onChange={setAddressType}
                />
              </div>
            )}

            {/* Campos adicionales para departamento */}
            {addressType === 'departamento' && (
              <>
                <div className="checkout-form-field">
                  <FormInput
                    type="text"
                    label="Piso"
                    placeholder="Ej: 3°, PB"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
                <div className="checkout-form-field">
                  <FormInput
                    type="text"
                    label="Timbre"
                    placeholder="Ej: A, 15"
                    value={doorbell}
                    onChange={(e) => setDoorbell(e.target.value)}
                  />
                </div>
              </>
            )}
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

      {/* Modal de alertas */}
      <AlertModalComponent />
    </div>
  )
}

export default function CheckoutPage() {
  return <CheckoutContent />
}

