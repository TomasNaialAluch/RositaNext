'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiBookOpen, HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import TopNavbar from '@/components/shop/TopNavbar'
import BottomNavbar from '@/components/shop/BottomNavbar'
import FilterChip from '@/components/shop/FilterChip'
import SearchInput from '@/components/shop/SearchInput'
import '@/styles/tienda.css'
import '@/styles/shop.css'
import '@/styles/recetas.css'

interface Receta {
  id: string
  titulo: string
  descripcion: string
  tiempoPreparacion: string
  dificultad: 'facil' | 'media' | 'dificil'
  categoria: 'vacuno' | 'cerdo' | 'pollo' | 'otros'
  preparaciones?: string[]
  imagen?: string
  ingredientes: string[]
  pasos: string[]
}

export default function RecetasPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'logo-falling' | 'logo-positioned' | 'navbar-expanding' | 'complete'>('complete')
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [recetas] = useState<Receta[]>([
    {
      id: '1',
      titulo: 'Asado a la Parrilla',
      descripcion: 'El clásico asado argentino, con el toque especial de Rosita',
      tiempoPreparacion: '2-3 horas',
      dificultad: 'media',
      categoria: 'vacuno',
      preparaciones: ['parrilla', 'asado'],
      ingredientes: [
        '1 kg de tira de asado',
        'Sal gruesa',
        'Carbón o leña',
        'Ajo (opcional)',
        'Perejil (opcional)'
      ],
      pasos: [
        'Preparar el fuego con carbón o leña, dejando que se forme una buena brasa.',
        'Salar la carne generosamente con sal gruesa, del lado de la grasa.',
        'Colocar la carne en la parrilla, con el lado de la grasa hacia arriba.',
        'Cocinar durante 1.5 a 2 horas, dando vuelta una sola vez.',
        'Retirar cuando la carne esté dorada por fuera y jugosa por dentro.',
        'Dejar reposar 10 minutos antes de cortar y servir.'
      ]
    },
    {
      id: '2',
      titulo: 'Bife de Chorizo a la Plancha',
      descripcion: 'Un corte premium, simple y delicioso',
      tiempoPreparacion: '20 minutos',
      dificultad: 'facil',
      categoria: 'vacuno',
      preparaciones: ['plancha'],
      ingredientes: [
        '2 bifes de chorizo de 200g cada uno',
        'Sal y pimienta',
        'Aceite de oliva',
        'Ajo (opcional)',
        'Romero (opcional)'
      ],
      pasos: [
        'Dejar los bifes a temperatura ambiente 30 minutos antes de cocinar.',
        'Salar y pimientar ambos lados de la carne.',
        'Calentar una plancha o sartén a fuego alto.',
        'Agregar un poco de aceite de oliva y colocar los bifes.',
        'Cocinar 4-5 minutos por lado para un término medio.',
        'Retirar y dejar reposar 5 minutos antes de servir.'
      ]
    },
    {
      id: '3',
      titulo: 'Matambre a la Pizza',
      descripcion: 'Una receta tradicional argentina con un toque especial',
      tiempoPreparacion: '1 hora',
      dificultad: 'media',
      categoria: 'vacuno',
      preparaciones: ['horno'],
      ingredientes: [
        '1 matambre de 1.5 kg',
        '200g de queso mozzarella',
        '200g de salsa de tomate',
        'Orégano',
        'Ajo',
        'Aceite de oliva',
        'Sal y pimienta'
      ],
      pasos: [
        'Preparar el matambre: hervirlo durante 40 minutos con ajo y hierbas.',
        'Retirar del agua y dejar enfriar.',
        'Untar con salsa de tomate, agregar queso mozzarella y orégano.',
        'Enrollar el matambre y atarlo con hilo de cocina.',
        'Colocar en una fuente con aceite de oliva.',
        'Cocinar en horno a 180°C durante 30 minutos.',
        'Dejar reposar, cortar en rodajas y servir.'
      ]
    }
  ])

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

  const mainCategories = ['vacuno', 'cerdo', 'pollo', 'otros']
  const preparations = ['parrilla', 'milanesa', 'horno', 'guiso', 'asado', 'plancha']
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPreparation, setSelectedPreparation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>(recetas)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let filtered = [...recetas]

    if (selectedCategory) {
      filtered = filtered.filter(receta => receta.categoria === selectedCategory)
    }

    if (selectedPreparation) {
      filtered = filtered.filter(receta => {
        if (!receta.preparaciones) return false
        return receta.preparaciones.includes(selectedPreparation)
      })
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(receta =>
        receta.titulo.toLowerCase().includes(query) ||
        receta.descripcion.toLowerCase().includes(query)
      )
    }

    setFilteredRecetas(filtered)
  }, [recetas, selectedCategory, selectedPreparation, searchQuery])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const handlePreparationClick = (preparation: string) => {
    setSelectedPreparation(selectedPreparation === preparation ? null : preparation)
  }

  const toggleReceta = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const getDificultadLabel = (dificultad: string) => {
    const dificultades: Record<string, string> = {
      'facil': 'Fácil',
      'media': 'Media',
      'dificil': 'Difícil'
    }
    return dificultades[dificultad] || dificultad
  }

  const getDificultadClass = (dificultad: string) => {
    const clases: Record<string, string> = {
      'facil': 'receta-dificultad-facil',
      'media': 'receta-dificultad-media',
      'dificil': 'receta-dificultad-dificil'
    }
    return clases[dificultad] || 'receta-dificultad-media'
  }

  return (
    <div className="shop-page">
      {/* Barra de navegación superior */}
      <TopNavbar stage={stage} isInitialLoad={isInitialLoad} />

      {/* Contenedor principal */}
      <main className="shop-main-content">
        <div className="recetas-content-container">
          <div className="recetas-header">
            <HiBookOpen className="recetas-header-icon" />
            <h1 className="recetas-title">Recetas</h1>
            <p className="recetas-subtitle">
              Descubre deliciosas recetas para preparar nuestros cortes premium
            </p>
          </div>

          {/* Filtros de recetas */}
          <div className="recetas-filters-container">
            <div className="tienda-filters-group">
              <p className="tienda-filters-label">Categorías principales</p>
              <div className="tienda-filters-main">
                {mainCategories.map((category) => (
                  <FilterChip
                    key={category}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    active={selectedCategory === category}
                    onClick={() => handleCategoryClick(category)}
                    size="large"
                  />
                ))}
              </div>
            </div>

            <div className="tienda-filters-group">
              <p className="tienda-filters-label">Métodos de preparación</p>
              <div className="tienda-filters-secondary">
                {preparations.map((preparation) => (
                  <FilterChip
                    key={preparation}
                    label={preparation.charAt(0).toUpperCase() + preparation.slice(1)}
                    active={selectedPreparation === preparation}
                    onClick={() => handlePreparationClick(preparation)}
                    size="small"
                  />
                ))}
              </div>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar recetas..."
            />
          </div>

          {filteredRecetas.length === 0 ? (
            <div className="recetas-empty">
              <p className="recetas-empty-text">No se encontraron recetas</p>
              {(selectedCategory || selectedPreparation || searchQuery) && (
                <button
                  className="recetas-empty-button"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedPreparation(null)
                    setSearchQuery('')
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="recetas-list">
              {filteredRecetas.map((receta) => (
                <div
                  key={receta.id}
                  className={`receta-card ${expandedId === receta.id ? 'expanded' : 'collapsed'}`}
                >
                  <button
                    className="receta-card-toggle"
                    onClick={() => toggleReceta(receta.id)}
                    aria-expanded={expandedId === receta.id}
                    aria-controls={`receta-content-${receta.id}`}
                  >
                    <h2 className="receta-titulo">{receta.titulo}</h2>
                    <div className="receta-meta">
                      <span className="receta-tiempo">
                        ⏱️ {receta.tiempoPreparacion}
                      </span>
                      <span className={`receta-dificultad ${getDificultadClass(receta.dificultad)}`}>
                        {getDificultadLabel(receta.dificultad)}
                      </span>
                    </div>
                    <span className="receta-toggle-icon">
                      {expandedId === receta.id ? <HiChevronUp /> : <HiChevronDown />}
                    </span>
                  </button>

                  <div
                    id={`receta-content-${receta.id}`}
                    className="receta-collapse"
                    data-expanded={expandedId === receta.id}
                  >
                    <p className="receta-descripcion">{receta.descripcion}</p>

                    <div className="receta-seccion">
                      <h3 className="receta-seccion-title">Ingredientes</h3>
                      <ul className="receta-list">
                        {receta.ingredientes.map((ingrediente, index) => (
                          <li key={index} className="receta-list-item">
                            {ingrediente}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="receta-seccion">
                      <h3 className="receta-seccion-title">Preparación</h3>
                      <ol className="receta-list receta-list-ordered">
                        {receta.pasos.map((paso, index) => (
                          <li key={index} className="receta-list-item">
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </div>
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
        activeItem="recetas"
        onNavigate={handleNavigate}
        isInitialLoad={isInitialLoad}
      />
    </div>
  )
}

