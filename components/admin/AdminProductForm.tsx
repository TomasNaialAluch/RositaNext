'use client'

import { useState } from 'react'
import { db, storage, auth } from '@/lib/firebase'
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { CUT_OPTIONS, PREPARATION_METHODS, CATEGORIES } from './constants'
import type { ProductFormData } from './types'

export default function AdminProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: 'vacuno',
    pricePerKg: 0,
    unitType: 'kg',
    minQuantity: 1,
    avgUnitWeight: undefined,
    cutOptions: [],
    preparation: [],
    image: null
  })

  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        throw new Error('Debes estar autenticado para subir productos')
      }

      let imageURL: string | null = null

      // Subir imagen si existe
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

      // Preparar datos del producto
      const productData: any = {
        name: formData.name,
        description: formData.description || null,
        price: Number(calculatedPrice.toFixed(2)),
        pricePerKg: formData.pricePerKg,
        image: imageURL,
        category: formData.category,
        unitType: formData.unitType,
        cutOptions: formData.cutOptions,
        preparation: formData.preparation.length > 0 ? formData.preparation : null,
        avgUnitWeight: formData.unitType === 'unidad' ? formData.avgUnitWeight : null,
        created_at: serverTimestamp()
      }

      // Agregar mínimo de venta si es por kilogramo
      if (formData.unitType === 'kg' && formData.minQuantity) {
        productData.minQuantity = formData.minQuantity
      }

      // Obtener el máximo order existente y asignar uno nuevo
      try {
        const productsRef = collection(db, 'products')
        const productsSnapshot = await getDocs(productsRef)
        let maxOrder = -1
        productsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.order !== undefined && data.order > maxOrder) {
            maxOrder = data.order
          }
        })
        productData.order = maxOrder + 1
      } catch {
        // Si falla, asignar 0 como orden por defecto
        productData.order = 0
      }

      // Guardar en Firestore
      await addDoc(collection(db, 'products'), productData)

      setSuccess(true)
      
      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        category: 'vacuno',
        pricePerKg: 0,
        unitType: 'kg',
        minQuantity: 1,
        avgUnitWeight: undefined,
        cutOptions: [],
        preparation: [],
        image: null
      })
      setImagePreview(null)
      
      // Limpiar input de archivo
      const fileInput = document.getElementById('image-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error al guardar producto:', err)
      setError(err.message || 'Error al guardar el producto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-form-container">
      <h2>Agregar Nuevo Producto</h2>
      
      {success && (
        <div className="admin-success">
          ✓ Producto guardado exitosamente
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
          <label htmlFor="name">Nombre del Producto *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Ej: Bife de Chorizo"
          />
        </div>

        {/* Descripción */}
        <div className="admin-form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Descripción del producto..."
          />
        </div>

        {/* Categoría */}
        <div className="admin-form-group">
          <label htmlFor="category">Categoría *</label>
          <select
            id="category"
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
          <label htmlFor="image-input">Imagen del Producto (opcional)</label>
          <input
            type="file"
            id="image-input"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="admin-image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        {/* Precio por kilogramo */}
        <div className="admin-form-group">
          <label htmlFor="pricePerKg">Precio por Kilogramo ($) *</label>
          <input
            type="number"
            id="pricePerKg"
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
          <label htmlFor="unitType">Tipo de Venta *</label>
          <select
            id="unitType"
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
            <label htmlFor="avgUnitWeight">Peso promedio por unidad (kg) *</label>
            <input
              type="number"
              id="avgUnitWeight"
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
            <label htmlFor="minQuantity">Mínimo de venta (kg) *</label>
            <input
              type="number"
              id="minQuantity"
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

        {/* Botón de envío */}
        <button 
          type="submit" 
          className="admin-submit-btn"
          disabled={uploading}
        >
          {uploading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  )
}

