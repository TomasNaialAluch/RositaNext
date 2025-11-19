'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut, onAuthStateChanged, updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { auth, storage, db } from '@/lib/firebase'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import CartDrawer from '@/components/shop/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import { useAlertModal } from '@/hooks/useAlertModal'
import '@/styles/shop.css'
import '@/styles/perfil.css'

function PerfilContent() {
  const router = useRouter()
  const { cartOpen, openCart, closeCart, cartTotal, showCart } = useCart()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError, AlertModalComponent } = useAlertModal()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para campos editables
  const [editableData, setEditableData] = useState({
    fullName: '',
    phone: '',
    address: '',
    addressType: 'casa' as 'casa' | 'departamento',
    floor: '',
    doorbell: ''
  })

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
        
        // Cargar información adicional del usuario desde Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUserData(data)
            // Inicializar datos editables
            setEditableData({
              fullName: data.fullName || currentUser.displayName || '',
              phone: data.phone || '',
              address: data.address || '',
              addressType: data.addressType || 'casa',
              floor: data.floor || '',
              doorbell: data.doorbell || ''
            })
          } else {
            // Si no existe el documento, crear uno básico
            const basicData = {
              fullName: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: null,
              address: null,
              addressType: null,
              floor: null,
              doorbell: null
            }
            setUserData(basicData)
            setEditableData({
              fullName: basicData.fullName,
              phone: '',
              address: '',
              addressType: 'casa',
              floor: '',
              doorbell: ''
            })
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error)
          // En caso de error, usar datos básicos de Auth
          const basicData = {
            fullName: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: null,
            address: null,
            addressType: null,
            floor: null,
            doorbell: null
          }
          setUserData(basicData)
          setEditableData({
            fullName: basicData.fullName,
            phone: '',
            address: '',
            addressType: 'casa',
            floor: '',
            doorbell: ''
          })
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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Restaurar valores originales
    if (userData) {
      setEditableData({
        fullName: userData.fullName || user?.displayName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        addressType: userData.addressType || 'casa',
        floor: userData.floor || '',
        doorbell: userData.doorbell || ''
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!user || !db) return
    
    try {
      setSaving(true)
      const userDocRef = doc(db, 'users', user.uid)
      
      // Preparar datos para guardar - filtrar undefined
      const dataToSave: any = {
        email: userData?.email || user.email,
        fullName: editableData.fullName,
        updatedAt: new Date()
      }
      
      // Solo agregar campos si tienen valor (no undefined)
      if (editableData.phone) {
        dataToSave.phone = editableData.phone
      }
      if (editableData.address) {
        dataToSave.address = editableData.address
      }
      if (editableData.addressType) {
        dataToSave.addressType = editableData.addressType
      }
      if (editableData.floor) {
        dataToSave.floor = editableData.floor
      }
      if (editableData.doorbell) {
        dataToSave.doorbell = editableData.doorbell
      }
      
      // Si existe userData, mantener campos que no se editan
      if (userData) {
        if (userData.role) {
          dataToSave.role = userData.role
        } else {
          dataToSave.role = 'user'
        }
        // Solo incluir createdAt si existe y no es undefined
        if (userData.createdAt !== undefined && userData.createdAt !== null) {
          dataToSave.createdAt = userData.createdAt
        }
        if (userData.photoURL || user.photoURL) {
          dataToSave.photoURL = userData.photoURL || user.photoURL
        }
      } else {
        dataToSave.role = 'user'
        dataToSave.createdAt = new Date()
        if (user.photoURL) {
          dataToSave.photoURL = user.photoURL
        }
      }
      
      // Guardar en Firestore
      await setDoc(userDocRef, dataToSave, { merge: true })
      
      // Actualizar también el displayName en Auth si cambió
      if (editableData.fullName !== user.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editableData.fullName
        })
      }
      
      // Actualizar estados locales
      setUserData(dataToSave)
      setUser({
        ...user,
        displayName: editableData.fullName
      })
      setIsEditing(false)
      showSuccess('¡Datos guardados!', 'Tu información se ha actualizado correctamente.')
    } catch (error) {
      console.error('Error al guardar datos:', error)
      showError('Error al guardar', 'No se pudieron guardar los datos. Por favor, intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (!auth) return
    
    try {
      setSigningOut(true)
      await signOut(auth)
      // Limpiar sessionStorage para que la próxima vez haga la animación completa
      sessionStorage.removeItem('shopNavbarAnimated')
      // Redirigir a la página de auth
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setSigningOut(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showError('Archivo inválido', 'Por favor, selecciona una imagen válida.')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Imagen demasiado grande', 'La imagen es demasiado grande. El tamaño máximo es 5MB.')
      return
    }

    try {
      setUploadingPhoto(true)
      
      // Crear referencia en Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`)
      
      // Subir archivo
      await uploadBytes(storageRef, file)
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef)
      
      // Actualizar perfil en Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        })
      }
      
      // Actualizar en Firestore si existe el documento
      const userDocRef = doc(db, 'users', user.uid)
      try {
        await updateDoc(userDocRef, {
          photoURL: downloadURL,
          updatedAt: new Date()
        })
      } catch (error) {
        // Si el documento no existe, no es problema
        console.log('Documento de usuario no existe en Firestore')
      }
      
      // Actualizar estado local
      setUser({
        ...user,
        photoURL: downloadURL
      })
      
      // Actualizar userData también
      if (userData) {
        setUserData({
          ...userData,
          photoURL: downloadURL
        })
      }
      
    } catch (error) {
      console.error('Error al subir foto:', error)
      showError('Error al subir foto', 'No se pudo subir la foto. Por favor, intenta nuevamente.')
    } finally {
      setUploadingPhoto(false)
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="shop-page">
        <div className="perfil-loading">
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
        <div className="perfil-content-container">
          {/* Información del usuario */}
          <div className="perfil-header">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {(userData?.photoURL || user?.photoURL) ? (
              <div 
                className="perfil-avatar" 
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Tocá para cambiar tu foto de perfil"
              >
                <img 
                  src={userData?.photoURL || user?.photoURL} 
                  alt={userData?.fullName || user?.displayName || 'Usuario'} 
                  className="perfil-avatar-image"
                />
                {uploadingPhoto && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    zIndex: 10
                  }}>
                    <span style={{ color: 'white', fontSize: '0.875rem' }}>Subiendo...</span>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="perfil-avatar-placeholder" 
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Tocá para subir tu foto de perfil"
              >
                <Image
                  src="/images/logo-simple.png"
                  alt="Rosita"
                  width={80}
                  height={80}
                  className="perfil-avatar-logo"
                  style={{ objectFit: 'contain', padding: '10px' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#BF5065',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <span style={{ color: 'white', fontSize: '1rem' }}>📷</span>
                </div>
                {uploadingPhoto && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    zIndex: 10
                  }}>
                    <span style={{ color: 'white', fontSize: '0.875rem' }}>Subiendo...</span>
                  </div>
                )}
              </div>
            )}
            
            <h1 className="perfil-name">
              {userData?.fullName || user?.displayName || 'Usuario'}
            </h1>
            
            {userData?.email && (
              <p className="perfil-email">{userData.email}</p>
            )}
          </div>

          {/* Sección de información adicional */}
          <div className="perfil-info-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="perfil-section-title" style={{ margin: 0 }}>Información de la cuenta</h2>
              {!isEditing && (
                <button 
                  onClick={handleEdit}
                  style={{
                    background: 'none',
                    border: '1px solid #BF5065',
                    color: '#BF5065',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Editar
                </button>
              )}
            </div>
            
            <div className="perfil-info-item">
              <span className="perfil-info-label">Email:</span>
              <span className="perfil-info-value">{userData?.email || user?.email || 'No disponible'}</span>
            </div>
            
            <div className="perfil-info-item">
              <span className="perfil-info-label">Nombre completo:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.fullName}
                  onChange={(e) => setEditableData({ ...editableData, fullName: e.target.value })}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.9375rem',
                    fontFamily: 'Inter, sans-serif',
                    width: '60%',
                    maxWidth: '200px'
                  }}
                />
              ) : (
                <span className="perfil-info-value">{userData?.fullName || user?.displayName || 'No disponible'}</span>
              )}
            </div>
            
            <div className="perfil-info-item">
              <span className="perfil-info-label">WhatsApp:</span>
              {isEditing ? (
                <input
                  type="tel"
                  value={editableData.phone}
                  onChange={(e) => setEditableData({ ...editableData, phone: e.target.value })}
                  placeholder="Ej: +541166246009"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.9375rem',
                    fontFamily: 'Inter, sans-serif',
                    width: '60%',
                    maxWidth: '200px'
                  }}
                />
              ) : (
                <span className="perfil-info-value">{userData?.phone || 'No disponible'}</span>
              )}
            </div>
          </div>

          {/* Sección de dirección */}
          <div className="perfil-info-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="perfil-section-title" style={{ margin: 0 }}>Dirección de entrega</h2>
              {!isEditing && (
                <button 
                  onClick={handleEdit}
                  style={{
                    background: 'none',
                    border: '1px solid #BF5065',
                    color: '#BF5065',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {userData?.address ? 'Editar' : 'Agregar'}
                </button>
              )}
            </div>
            
            <div className="perfil-info-item">
              <span className="perfil-info-label">Dirección:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.address}
                  onChange={(e) => setEditableData({ ...editableData, address: e.target.value })}
                  placeholder="Ej: Av. Libertador 5603"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    fontSize: '0.9375rem',
                    fontFamily: 'Inter, sans-serif',
                    width: '60%',
                    maxWidth: '200px'
                  }}
                />
              ) : (
                <span className="perfil-info-value">{userData?.address || 'No disponible'}</span>
              )}
            </div>
            
            {isEditing && (
              <>
                <div className="perfil-info-item">
                  <span className="perfil-info-label">Tipo de vivienda:</span>
                  <select
                    value={editableData.addressType}
                    onChange={(e) => setEditableData({ ...editableData, addressType: e.target.value as 'casa' | 'departamento' })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      fontSize: '0.9375rem',
                      fontFamily: 'Inter, sans-serif',
                      width: '60%',
                      maxWidth: '200px'
                    }}
                  >
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                  </select>
                </div>
                
                {editableData.addressType === 'departamento' && (
                  <>
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">Piso:</span>
                      <input
                        type="text"
                        value={editableData.floor}
                        onChange={(e) => setEditableData({ ...editableData, floor: e.target.value })}
                        placeholder="Ej: 3°, PB"
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          fontSize: '0.9375rem',
                          fontFamily: 'Inter, sans-serif',
                          width: '60%',
                          maxWidth: '200px'
                        }}
                      />
                    </div>
                    
                    <div className="perfil-info-item">
                      <span className="perfil-info-label">Timbre:</span>
                      <input
                        type="text"
                        value={editableData.doorbell}
                        onChange={(e) => setEditableData({ ...editableData, doorbell: e.target.value })}
                        placeholder="Ej: A, 15"
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          fontSize: '0.9375rem',
                          fontFamily: 'Inter, sans-serif',
                          width: '60%',
                          maxWidth: '200px'
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            
            {!isEditing && (
              <>
                {userData?.addressType && (
                  <div className="perfil-info-item">
                    <span className="perfil-info-label">Tipo de vivienda:</span>
                    <span className="perfil-info-value">
                      {userData.addressType === 'casa' ? 'Casa' : 'Departamento'}
                    </span>
                  </div>
                )}
                
                {userData?.floor && (
                  <div className="perfil-info-item">
                    <span className="perfil-info-label">Piso:</span>
                    <span className="perfil-info-value">{userData.floor}</span>
                  </div>
                )}
                
                {userData?.doorbell && (
                  <div className="perfil-info-item">
                    <span className="perfil-info-label">Timbre:</span>
                    <span className="perfil-info-value">{userData.doorbell}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Botones de guardar/cancelar cuando está editando */}
          {isEditing && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              width: '100%', 
              marginTop: '1rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: '#BF5065',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  flex: 1,
                  height: '44px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Botón de cerrar sesión */}
        <div className="perfil-signout-container">
          <button 
            className="perfil-signout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </main>

      {/* Barra de navegación inferior */}
      {!cartOpen && (
        <BottomNavbar 
          stage={stage} 
          showCart={showCart}
          onCartOpen={openCart}
          activeItem="perfil"
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

      {/* Modal de alertas */}
      <AlertModalComponent />
    </div>
  )
}

export default function PerfilPage() {
  return <PerfilContent />
}

