'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { HiClipboardDocumentList } from 'react-icons/hi2'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import '@/styles/shop.css'
import '@/styles/pedidos.css'

interface Pedido {
  id: string
  fecha: string
  estado: 'pendiente' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado'
  total: number
  items: Array<{
    nombre: string
    cantidad: number
    precio: number
  }>
}

export default function PedidosPage() {
  const router = useRouter()
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
    if (!auth) {
      setLoading(false)
      return
    }

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        // TODO: Cargar pedidos del usuario desde Firestore
        // Por ahora, dejamos la lista vacía
        setPedidos([])
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
                        <span className="pedido-item-nombre">{item.nombre}</span>
                        <span className="pedido-item-cantidad">x{item.cantidad}</span>
                        <span className="pedido-item-precio">{formatPrice(item.precio * item.cantidad)}</span>
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
      <BottomNavbar 
        stage={stage} 
        activeItem="pedidos"
        onNavigate={handleNavigate}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}

