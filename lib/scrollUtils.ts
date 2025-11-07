/**
 * Función utilitaria para hacer scroll suave en un contenedor
 * @param scrollContainer - El elemento contenedor que tiene el scroll
 * @param targetPosition - La posición objetivo donde queremos hacer scroll (en píxeles desde arriba)
 * @param duration - Duración de la animación en milisegundos (default: 2000ms)
 * @param offset - Offset adicional en píxeles (default: -100 para dejar margen arriba)
 */
export function smoothScrollTo(
  scrollContainer: HTMLElement,
  targetPosition: number,
  duration: number = 2000,
  offset: number = -100
): void {
  const startPosition = scrollContainer.scrollTop
  const targetScrollPosition = targetPosition + offset
  const distance = targetScrollPosition - startPosition

  if (Math.abs(distance) < 10) return

  let startTime: number | null = null
  let lastScrollTop = startPosition

  const animate = (timestamp: number) => {
    if (startTime === null) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Función de easing suave (ease-in-out cuadrático)
    const ease = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    const newScroll = startPosition + distance * ease
    
    // Intentar scrollTop primero
    scrollContainer.scrollTop = newScroll
    
    // Si scrollTop no cambió, intentar scrollTo
    if (Math.abs(scrollContainer.scrollTop - lastScrollTop) < 0.1 && progress < 1) {
      scrollContainer.scrollTo({
        top: newScroll,
        behavior: 'auto'
      })
    }
    
    lastScrollTop = scrollContainer.scrollTop

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

/**
 * Función para hacer scroll a un elemento específico dentro de un contenedor
 * @param scrollContainer - El elemento contenedor que tiene el scroll
 * @param targetElement - El elemento objetivo al que queremos hacer scroll
 * @param duration - Duración de la animación en milisegundos (default: 2000ms)
 * @param offset - Offset adicional en píxeles (default: -100 para dejar margen arriba)
 */
export function smoothScrollToElement(
  scrollContainer: HTMLElement,
  targetElement: HTMLElement,
  duration: number = 2000,
  offset: number = -100
): void {
  // Obtener las posiciones relativas
  const targetRect = targetElement.getBoundingClientRect()
  const containerRect = scrollContainer.getBoundingClientRect()
  const currentScroll = scrollContainer.scrollTop
  
  // Calcular la posición objetivo relativa al contenedor
  const relativeTop = targetRect.top - containerRect.top
  const targetPosition = currentScroll + relativeTop
  
  // Verificar si el contenedor tiene scroll disponible
  const scrollHeight = scrollContainer.scrollHeight
  const clientHeight = scrollContainer.clientHeight
  const maxScroll = scrollHeight - clientHeight
  
  // Si no hay scroll disponible (scrollHeight === clientHeight), usar window.scrollTo
  if (maxScroll <= 0) {
    // Calcular la posición absoluta del elemento en la página
    const elementTop = targetRect.top + window.scrollY
    const targetWindowScroll = elementTop + offset
    
    // Hacer scroll en window con animación personalizada de 2 segundos
    const startWindowScroll = window.scrollY
    const windowDistance = targetWindowScroll - startWindowScroll
    
    if (Math.abs(windowDistance) < 10) return
    
    let startTime: number | null = null
    
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Función de easing suave
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      const newWindowScroll = startWindowScroll + windowDistance * ease
      
      window.scrollTo({
        top: newWindowScroll,
        behavior: 'auto'
      })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  } else {
    // Si hay scroll disponible, usar nuestra función personalizada
    smoothScrollTo(scrollContainer, targetPosition, duration, offset)
  }
}

