'use client'

import { useEffect, useRef, useState } from 'react'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

// Extender el tipo Window para incluir google
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement, options?: {
            types?: string[]
            componentRestrictions?: { country: string }
            fields?: string[]
          }) => {
            getPlace: () => {
              formatted_address?: string
              geometry?: {
                location: {
                  lat: () => number
                  lng: () => number
                }
              }
            }
            addListener: (event: string, callback: () => void) => void
          }
        }
        event?: {
          clearInstanceListeners: (instance: any) => void
        }
      }
    }
  }
}

export default function AddressInput({
  value,
  onChange,
  placeholder = 'Dirección',
  label,
  required = false
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined') return

    // Verificar si Google Maps ya está cargado
    if (window.google?.maps?.places) {
      setIsGoogleMapsLoaded(true)
      initAutocomplete()
      return
    }

    // Si no está cargado, verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Esperar a que el script se cargue
      existingScript.addEventListener('load', () => {
        setIsGoogleMapsLoaded(true)
        initAutocomplete()
      })
      return
    }

    // Cargar el script de Google Maps
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCdilgyg87D9pDIM1Gvs-H5DqtfbTpC3ys&libraries=places&language=es&loading=async`
    script.async = true
    script.defer = true
    script.id = 'google-maps-script'
    
    script.onload = () => {
      setIsGoogleMapsLoaded(true)
      initAutocomplete()
    }

    script.onerror = () => {
      console.error('Error al cargar Google Maps API')
    }

    document.head.appendChild(script)

    function initAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places) return

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'ar' }, // Argentina
            fields: ['formatted_address', 'geometry']
          }
        )

        autocompleteRef.current = autocomplete

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            onChange(place.formatted_address)
            setIsValid(true)
          }
        })

        // Validar mientras escribe
        const inputElement = inputRef.current
        const handleInput = (e: Event) => {
          const target = e.target as HTMLInputElement
          setIsValid(target.value.length >= 5)
        }
        
        inputElement.addEventListener('input', handleInput)

        // Cleanup
        return () => {
          inputElement.removeEventListener('input', handleInput)
          if (autocompleteRef.current && window.google?.maps?.event) {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
          }
        }
      } catch (error) {
        console.error('Error al inicializar Google Places Autocomplete:', error)
      }
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [onChange, isGoogleMapsLoaded])

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={`form-input ${isValid && value ? 'form-input-valid' : ''}`}
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsValid(e.target.value.length >= 5)
          }}
        />
        {isValid && value && (
          <div className="form-input-check">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#BF5065"/>
              <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

