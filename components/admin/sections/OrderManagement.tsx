'use client'

import { useEffect, useState } from 'react'
import { collection, query, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAlertModal } from '@/hooks/useAlertModal'
import '@/styles/admin.css'

interface Order {
  id: string
  userId: string
  items: Array<{
    id?: string
    productId: string
    name: string
    price: number
    quantity: number
    unitType: 'kg' | 'unidad'
    cutOption?: string
    image?: string
    avgUnitWeight?: number | null
  }>
  total: number
  shipping: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    addressType?: string
    floor?: string
    doorbell?: string
  }
  status: 'pending' | 'en_preparacion' | 'en_camino' | 'entregado' | 'cancelado'
  createdAt: Timestamp | Date | string
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { showSuccess, showError, AlertModalComponent } = useAlertModal()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersRef = collection(db, 'orders')
      // Usar consulta sin orderBy para evitar necesidad de índice compuesto
      const q = query(ordersRef)
      
      const querySnapshot = await getDocs(q)
      const ordersData: Order[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Manejar createdAt de forma segura
        let createdAt: Timestamp | Date | string = new Date()
        if (data.createdAt) {
          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt
          } else if (data.createdAt.toDate) {
            createdAt = data.createdAt.toDate()
          } else if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt
          } else if (data.createdAt.seconds) {
            // Si es un objeto con seconds (Timestamp serializado)
            createdAt = new Date(data.createdAt.seconds * 1000)
          }
        }
        
        ordersData.push({
          id: doc.id,
          userId: data.userId || '',
          items: data.items || [],
          total: data.total || 0,
          shipping: data.shipping || {},
          status: data.status || 'pending',
          createdAt: createdAt
        })
      })
      
      // Ordenar manualmente por fecha (más reciente primero)
      ordersData.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp 
          ? a.createdAt.toDate().getTime()
          : typeof a.createdAt === 'string'
          ? new Date(a.createdAt).getTime()
          : a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : 0
        const dateB = b.createdAt instanceof Timestamp
          ? b.createdAt.toDate().getTime()
          : typeof b.createdAt === 'string'
          ? new Date(b.createdAt).getTime()
          : b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : 0
        return dateB - dateA // Más reciente primero
      })
      
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      showError('Error', 'No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, { status: newStatus })
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      showSuccess('Éxito', 'Estado del pedido actualizado correctamente')
    } catch (error) {
      console.error('Error updating order status:', error)
      showError('Error', 'No se pudo actualizar el estado del pedido')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const formatDate = (date: Timestamp | Date | string | null | undefined) => {
    let dateObj: Date
    
    if (!date) {
      dateObj = new Date()
    } else if (date instanceof Timestamp) {
      dateObj = date.toDate()
    } else if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date()
    }
    
    // Validar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date()
    }
    
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'en_preparacion': 'En preparación',
      'en_camino': 'En camino',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    }
    return labels[status] || status
  }

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      'pending': 'order-status-pending',
      'en_preparacion': 'order-status-preparing',
      'en_camino': 'order-status-shipping',
      'entregado': 'order-status-delivered',
      'cancelado': 'order-status-cancelled'
    }
    return classes[status] || 'order-status-pending'
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  if (loading) {
    return (
      <div className="admin-section">
        <h2 className="admin-section-title">Gestión de Pedidos</h2>
        <div className="admin-loading">
          <p>Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Gestión de Pedidos</h2>
      
      {/* Filtros */}
      <div className="admin-filters">
        <button
          className={`admin-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Todos ({orders.length})
        </button>
        <button
          className={`admin-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pendientes ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          className={`admin-filter-btn ${filterStatus === 'en_preparacion' ? 'active' : ''}`}
          onClick={() => setFilterStatus('en_preparacion')}
        >
          En preparación ({orders.filter(o => o.status === 'en_preparacion').length})
        </button>
        <button
          className={`admin-filter-btn ${filterStatus === 'en_camino' ? 'active' : ''}`}
          onClick={() => setFilterStatus('en_camino')}
        >
          En camino ({orders.filter(o => o.status === 'en_camino').length})
        </button>
        <button
          className={`admin-filter-btn ${filterStatus === 'entregado' ? 'active' : ''}`}
          onClick={() => setFilterStatus('entregado')}
        >
          Entregados ({orders.filter(o => o.status === 'entregado').length})
        </button>
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="admin-empty-state">
          <p>No hay pedidos {filterStatus !== 'all' ? `con estado "${getStatusLabel(filterStatus)}"` : ''}</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-header">
                <div className="admin-order-info">
                  <h3 className="admin-order-id">Pedido #{order.id.slice(0, 8)}</h3>
                  <p className="admin-order-date">{formatDate(order.createdAt)}</p>
                  <p className="admin-order-user">Usuario: {order.shipping.email || order.userId}</p>
                </div>
                <div className="admin-order-status-section">
                  <span className={`admin-order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <select
                    className="admin-order-status-select"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="en_preparacion">En preparación</option>
                    <option value="en_camino">En camino</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="admin-order-items">
                <h4>Productos:</h4>
                <ul className="admin-order-items-list">
                  {order.items.map((item, index) => (
                    <li key={index} className="admin-order-item">
                      <span className="admin-order-item-name">
                        {item.name}
                        {item.cutOption && ` - ${item.cutOption}`}
                      </span>
                      <span className="admin-order-item-quantity">
                        {item.quantity} {item.unitType === 'kg' ? 'kg' : 'un'}
                      </span>
                      <span className="admin-order-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Información de envío */}
              <div className="admin-order-shipping">
                <h4>Datos de entrega:</h4>
                <div className="admin-order-shipping-info">
                  <p><strong>Nombre:</strong> {order.shipping.fullName || 'No disponible'}</p>
                  <p><strong>Email:</strong> {order.shipping.email || 'No disponible'}</p>
                  <p><strong>Teléfono:</strong> {order.shipping.phone || 'No disponible'}</p>
                  <p><strong>Dirección:</strong> {order.shipping.address || 'No disponible'}</p>
                  {order.shipping.addressType && (
                    <p><strong>Tipo:</strong> {order.shipping.addressType === 'casa' ? 'Casa' : 'Departamento'}</p>
                  )}
                  {order.shipping.floor && (
                    <p><strong>Piso:</strong> {order.shipping.floor}</p>
                  )}
                  {order.shipping.doorbell && (
                    <p><strong>Timbre:</strong> {order.shipping.doorbell}</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="admin-order-footer">
                <span className="admin-order-total-label">Total:</span>
                <span className="admin-order-total-amount">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertModalComponent />
    </div>
  )
}

