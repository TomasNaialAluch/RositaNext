'use client'

import { useState, useEffect } from 'react'
import { db, storage, auth } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { CUT_OPTIONS, PREPARATION_METHODS, CATEGORIES } from './constants'
import type { Product, ProductFormData } from './types'

interface ProductEditModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

interface ExtendedProductFormData extends ProductFormData {
  existingImage?: string
}

export default function ProductEditModal({ product, isOpen, onClose }: ProductEditModalProps) {
  const [formData, setFormData] = useState<ExtendedProductFormData>({
    name: '',
    description: '',
    category: 'vacuno',
    pricePerKg: 0,
    unitType: 'kg',
    minQuantity: 1,
    avgUnitWeight: undefined,
    cutOptions: [],
    preparation: [],
    image: null,
    existingImage: undefined
  })

  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'vacuno',
        pricePerKg: product.pricePerKg || 0,
        unitType: product.unitType || 'kg',
        minQuantity: product.minQuantity,
        avgUnitWeight: product.avgUnitWeight || undefined,
        cutOptions: product.cutOptions || [],
        preparation: Array.isArray(product.preparation) ? product.preparation : (product.preparation ? [product.preparation] : []),
        image: null,
        existingImage: product.image
      })
      setImagePreview(product.image || null)
      setError(null)
      setSuccess(false)
      setShowDeleteConfirm(false)
    }
  }, [isOpen, product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData(prev => {
      if (name === 'pricePerKg') {
        return { ...prev, pricePerKg: parseFloat(value) || 0 }
      }

      if (name === 'minQuantity') {
        return { ...prev, minQuantity: value === '' ? undefined : parseFloat(value) || 0 }
      }

      if (name === 'avgUnitWeight') {
        return { ...prev, avgUnitWeight: value === '' ? undefined : parseFloat(value) || 0 }
      }

      return { ...prev, [name]: value }
    })
  }

  const handleUnitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitType = e.target.value as 'kg' | 'unidad'
    setFormData(prev => ({
      ...prev,
      unitType,
      minQuantity: unitType === 'kg'
        ? (prev.minQuantity && prev.minQuantity > 0 ? prev.minQuantity : 1)
        : undefined,
      avgUnitWeight: unitType === 'unidad'
        ? (prev.avgUnitWeight && prev.avgUnitWeight > 0 ? prev.avgUnitWeight : 1)
        : undefined
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCutOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      cutOptions: prev.cutOptions.includes(option)
        ? prev.cutOptions.filter(o => o !== option)
        : [...prev.cutOptions, option]
    }))
  }

  const togglePreparation = (method: string) => {
    setFormData(prev => ({
      ...prev,
      preparation: prev.preparation.includes(method)
        ? prev.preparation.filter(m => m !== method)
        : [...prev.preparation, method]
    }))
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Debes estar autenticado para eliminar productos')
      }

      // Eliminar imagen de Storage si existe
      if (product.image) {
        try {
          const imageUrl = product.image
          
          // Intentar extraer el path de diferentes formatos de URL de Firebase Storage
          let imagePath: string | null = null
          
          // Formato 1: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media&token=TOKEN
          if (imageUrl.includes('/o/')) {
            const urlParts = imageUrl.split('/o/')
            if (urlParts.length > 1) {
              const pathWithParams = urlParts[1].split('?')[0]
              imagePath = decodeURIComponent(pathWithParams)
            }
          }
          // Formato 2: gs://BUCKET/PATH o https://BUCKET.storage.googleapis.com/PATH
          else if (imageUrl.includes('gs://')) {
            imagePath = imageUrl.replace('gs://rosita-b76eb.firebasestorage.app/', '')
          }
          // Si la URL ya es un path relativo
          else if (!imageUrl.startsWith('http')) {
            imagePath = imageUrl
          }
          
          if (imagePath) {
            const imageRef = ref(storage, imagePath)
            await deleteObject(imageRef)
          }
        } catch (deleteImageError: any) {
          console.error('Error al eliminar imagen:', deleteImageError)
          // Continuar aunque falle la eliminación de la imagen
        }
      }

      // Eliminar documento de Firestore
      const productRef = doc(db, 'products', product.id)
      await deleteDoc(productRef)

      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Error al eliminar producto:', err)
      setError(err.message || 'Error al eliminar el producto')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setUploading(true)

    try {
      if (formData.pricePerKg <= 0) {
        throw new Error('El precio por kilogramo debe ser mayor a 0')
      }

      if (formData.unitType === 'kg' && (!formData.minQuantity || formData.minQuantity <= 0)) {
        throw new Error('Debes indicar el mínimo de venta en kilogramos')
      }

      if (formData.unitType === 'unidad' && (!formData.avgUnitWeight || formData.avgUnitWeight <= 0)) {
        throw new Error('Debes indicar el peso promedio por unidad (en kg)')
      }

      // Verificar que el usuario esté autenticado
      const user = auth.currentUser
      if (!user) {
        throw new Error('Debes estar autenticado para editar productos')
      }

      let imageURL: string | null = formData.existingImage || null

      // Subir nueva imagen si existe
      if (formData.image) {
        // Generar nombre único para evitar conflictos
        const timestamp = Date.now()
        const fileName = `${timestamp}_${formData.image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const imageRef = ref(storage, `products/${fileName}`)
        
        try {
          await uploadBytes(imageRef, formData.image)
          imageURL = await getDownloadURL(imageRef)
        } catch (uploadError: any) {
          console.error('Error al subir imagen:', uploadError)
          throw new Error(`Error al subir la imagen: ${uploadError.message || 'Error desconocido'}`)
        }
      }

      const calculatedPrice =
        formData.unitType === 'kg'
          ? formData.pricePerKg
          : (formData.avgUnitWeight || 0) * formData.pricePerKg

      // Preparar datos del producto para actualizar
      const productData: any = {
        name: formData.name,
        description: formData.description || null,
        price: Number(calculatedPrice.toFixed(2)),
        pricePerKg: formData.pricePerKg,
        category: formData.category,
        unitType: formData.unitType,
        cutOptions: formData.cutOptions,
        preparation: formData.preparation.length > 0 ? formData.preparation : null,
        avgUnitWeight: formData.unitType === 'unidad' ? formData.avgUnitWeight : null,
      }

      // Actualizar imagen solo si hay una nueva o si ya existía una
      if (imageURL !== null) {
        productData.image = imageURL
      }

      // Agregar mínimo de venta si es por kilogramo
      if (formData.unitType === 'kg' && formData.minQuantity) {
        productData.minQuantity = formData.minQuantity
      } else {
        productData.minQuantity = null
      }

      // Actualizar en Firestore
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, productData)

      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Error al actualizar producto:', err)
      setError(err.message || 'Error al actualizar el producto')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Editar Producto</h2>
          <button className="admin-modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {success && (
          <div className="admin-success">
            ✓ Producto actualizado exitosamente
          </div>
        )}

        {error && (
          <div className="admin-error">
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Nombre */}
          <div className="admin-form-group">
            <label htmlFor="edit-name">Nombre del Producto *</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Ej: Bife de Chorizo"
            />
          </div>

          {/* Descripción */}
          <div className="admin-form-group">
            <label htmlFor="edit-description">Descripción</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Categoría */}
          <div className="admin-form-group">
            <label htmlFor="edit-category">Categoría *</label>
            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div className="admin-form-group">
            <label htmlFor="edit-image-input">Imagen del Producto</label>
            {imagePreview && (
              <div className="admin-image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              id="edit-image-input"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>Deja vacío para mantener la imagen actual, o selecciona una nueva imagen</small>
          </div>

          {/* Precio por kilogramo */}
          <div className="admin-form-group">
            <label htmlFor="edit-pricePerKg">Precio por Kilogramo ($) *</label>
            <input
              type="number"
              id="edit-pricePerKg"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Tipo de venta */}
          <div className="admin-form-group">
            <label htmlFor="edit-unitType">Tipo de Venta *</label>
            <select
              id="edit-unitType"
              name="unitType"
              value={formData.unitType}
              onChange={handleUnitTypeChange}
              required
            >
              <option value="kg">Por Kilogramo</option>
              <option value="unidad">Por Unidad</option>
            </select>
          </div>

          {/* Peso promedio por unidad o mínimo de venta */}
          {formData.unitType === 'unidad' ? (
            <div className="admin-form-group">
              <label htmlFor="edit-avgUnitWeight">Peso promedio por unidad (kg) *</label>
              <input
                type="number"
                id="edit-avgUnitWeight"
                name="avgUnitWeight"
                value={formData.avgUnitWeight ?? ''}
                onChange={handleInputChange}
                required
                min="0.1"
                step="0.1"
                placeholder="Ej: 5"
              />
              <small>
                Este valor se multiplicará por el precio por kg para calcular el precio aproximado de cada unidad.
              </small>
            </div>
          ) : (
            <div className="admin-form-group">
              <label htmlFor="edit-minQuantity">Mínimo de venta (kg) *</label>
              <input
                type="number"
                id="edit-minQuantity"
                name="minQuantity"
                value={formData.minQuantity ?? ''}
                onChange={handleInputChange}
                required
                min="0.1"
                step="0.1"
                placeholder="Ej: 1"
              />
              <small>Este será el mínimo disponible para que el cliente pueda comprar.</small>
            </div>
          )}

          {/* Opciones de corte */}
          <div className="admin-form-group">
            <label>Opciones de Corte</label>
            <div className="admin-checkbox-group">
              {CUT_OPTIONS.map(option => (
                <label key={option} className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.cutOptions.includes(option)}
                    onChange={() => toggleCutOption(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Métodos de preparación */}
          <div className="admin-form-group">
            <label>Métodos de Preparación</label>
            <div className="admin-checkbox-group">
              {PREPARATION_METHODS.map(method => (
                <label key={method} className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preparation.includes(method)}
                    onChange={() => togglePreparation(method)}
                  />
                  <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="admin-form-actions">
            <button 
              type="button"
              className="admin-delete-btn"
              onClick={handleDelete}
              disabled={uploading || deleting}
            >
              {deleting ? 'Eliminando...' : showDeleteConfirm ? 'Confirmar Eliminación' : 'Eliminar Producto'}
            </button>
            <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
              <button 
                type="button"
                className="admin-cancel-btn"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onClose()
                }}
                disabled={uploading || deleting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="admin-submit-btn"
                disabled={uploading || deleting}
              >
                {uploading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

