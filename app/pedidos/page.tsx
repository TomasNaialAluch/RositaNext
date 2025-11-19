'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { HiClipboardDocumentList } from 'react-icons/hi2'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import CartDrawer from '@/components/shop/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import '@/styles/shop.css'
import '@/styles/pedidos.css'

interface Pedido {
  id: string
  fecha: string
  estado: 'pending' | 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado'
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
    cutOption?: string
    unitType?: string
  }>
  shipping?: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    addressType?: string
    floor?: string
    doorbell?: string
  }
}

function PedidosContent() {
  const router = useRouter()
  const { cartOpen, openCart, closeCart, cartTotal, showCart } = useCart()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    // Si ya se animó en otra página, usar animación rápida (aparecer inmediatamente)
    const hasAnimated = sessionStorage.getItem('shopNavbarAnimated')
    
    if (hasAnimated) {
      setIsInitialLoad(false)
      setStage('complete')
    } else {
      // Si es la primera vez, hacer animación inicial
      setIsInitialLoad(true)
      setStage('logo-falling')
      
      const timer1 = setTimeout(() => {
        setStage('logo-positioned')
      }, 1000)

      const timer2 = setTimeout(() => {
        setStage('navbar-expanding')
      }, 1500)

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

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        
        // Cargar pedidos del usuario desde Firestore
        try {
          console.log('Cargando pedidos para usuario:', currentUser.uid)
          const ordersRef = collection(db, 'orders')
          
          // Usar consulta sin orderBy para evitar necesidad de índice compuesto
          // Ordenaremos manualmente después
          const q = query(
            ordersRef,
            where('userId', '==', currentUser.uid)
          )
          
          const querySnapshot = await getDocs(q)
          console.log('Pedidos encontrados:', querySnapshot.size)
          
          const pedidosData: Pedido[] = []
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log('Pedido encontrado:', doc.id, data)
            
            // Convertir createdAt de Firestore Timestamp a ISO string
            let fechaISO = new Date().toISOString()
            if (data.createdAt) {
              if (data.createdAt.toDate) {
                fechaISO = data.createdAt.toDate().toISOString()
              } else if (data.createdAt.seconds) {
                fechaISO = new Date(data.createdAt.seconds * 1000).toISOString()
              }
            }
            
            pedidosData.push({
              id: doc.id,
              fecha: fechaISO,
              estado: data.status || 'pending',
              total: data.total || 0,
              items: data.items || [],
              shipping: data.shipping || {}
            })
          })
          
          // Ordenar manualmente por fecha (más reciente primero)
          pedidosData.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime()
            const dateB = new Date(b.fecha).getTime()
            return dateB - dateA // Más reciente primero
          })
          
          console.log('Pedidos procesados:', pedidosData.length)
          setPedidos(pedidosData)
        } catch (error: any) {
          console.error('Error loading orders:', error)
          // Si el error menciona índice, mostrar mensaje útil
          if (error.message && error.message.includes('index')) {
            console.warn('Nota: Necesitas crear un índice compuesto en Firestore para ordenar por fecha. Por ahora se muestran sin ordenar.')
          }
          setPedidos([])
        }
      } else {
        // Si no hay usuario, redirigir a auth
        router.push('/')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getEstadoLabel = (estado: string) => {
    const estados: Record<string, string> = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'en_preparacion': 'En preparación',
      'en_camino': 'En camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    }
    return estados[estado] || estado
  }

  const getEstadoClass = (estado: string) => {
    const clases: Record<string, string> = {
      'pending': 'pedido-estado-pendiente',
      'pendiente': 'pedido-estado-pendiente',
      'en_preparacion': 'pedido-estado-preparacion',
      'en_camino': 'pedido-estado-camino',
      'entregado': 'pedido-estado-entregado',
      'cancelado': 'pedido-estado-cancelado'
    }
    return clases[estado] || 'pedido-estado-pendiente'
  }

  if (loading) {
    return (
      <div className="shop-page">
        <div className="pedidos-loading">
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
      <main className="shop-main-content">
        <div className="pedidos-content-container">
          <h1 className="pedidos-title">Mis Pedidos</h1>

          {pedidos.length === 0 ? (
            <div className="pedidos-empty">
              <HiClipboardDocumentList className="pedidos-empty-icon" />
              <p className="pedidos-empty-text">No tienes pedidos aún</p>
              <p className="pedidos-empty-subtext">
                Cuando realices tu primer pedido, aparecerá aquí
              </p>
              <button 
                className="pedidos-empty-button"
                onClick={() => router.push('/tienda')}
              >
                Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="pedidos-list">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="pedido-card">
                  <div className="pedido-header">
                    <div className="pedido-info">
                      <h3 className="pedido-id">Pedido #{pedido.id.slice(0, 8)}</h3>
                      <p className="pedido-fecha">{formatDate(pedido.fecha)}</p>
                    </div>
                    <span className={`pedido-estado ${getEstadoClass(pedido.estado)}`}>
                      {getEstadoLabel(pedido.estado)}
                    </span>
                  </div>

                  <div className="pedido-items">
                    {pedido.items.map((item, index) => (
                      <div key={index} className="pedido-item">
                        <span className="pedido-item-nombre">
                          {item.name}
                          {item.cutOption && ` - ${item.cutOption}`}
                        </span>
                        <span className="pedido-item-cantidad">
                          {item.quantity} {item.unitType === 'kg' ? 'kg' : 'un'}
                        </span>
                        <span className="pedido-item-precio">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pedido-footer">
                    <span className="pedido-total-label">Total:</span>
                    <span className="pedido-total-amount">{formatPrice(pedido.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Barra de navegación inferior */}
      {!cartOpen && (
        <BottomNavbar 
          stage={stage} 
          showCart={showCart}
          onCartOpen={openCart}
          activeItem="pedidos"
          onNavigate={handleNavigate}
          isInitialLoad={isInitialLoad}
        />
      )}

      {/* Drawer del carrito */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={closeCart}
        total={cartTotal}
      />
    </div>
  )
}

export default function PedidosPage() {
  return <PedidosContent />
}

