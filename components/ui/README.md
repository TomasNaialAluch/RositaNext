# Componentes UI - Rosita

## Modal y AlertModal

Componentes reutilizables con la estética de Rosita para mostrar modales y alertas en toda la aplicación.

### RositaModal

Modal base reutilizable con la estética de Rosita.

**Props:**
- `isOpen: boolean` - Controla si el modal está abierto
- `onClose: () => void` - Función que se ejecuta al cerrar el modal
- `title?: string` - Título del modal (opcional)
- `children: React.ReactNode` - Contenido del modal
- `showCloseButton?: boolean` - Mostrar botón de cerrar (default: true)
- `size?: 'small' | 'medium' | 'large'` - Tamaño del modal (default: 'medium')

**Ejemplo de uso:**
```tsx
import RositaModal from '@/components/ui/RositaModal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Modal</button>
      <RositaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Mi Modal"
        size="medium"
      >
        <p>Contenido del modal</p>
      </RositaModal>
    </>
  )
}
```

### AlertModal

Modal especializado para mostrar alertas (éxito, error, advertencia, información).

**Props:**
- `isOpen: boolean` - Controla si el modal está abierto
- `onClose: () => void` - Función que se ejecuta al cerrar
- `type: 'success' | 'error' | 'warning' | 'info'` - Tipo de alerta
- `title: string` - Título de la alerta
- `message: string` - Mensaje de la alerta
- `onConfirm?: () => void` - Función opcional que se ejecuta al confirmar
- `confirmText?: string` - Texto del botón de confirmar (default: 'Aceptar')
- `cancelText?: string` - Texto del botón de cancelar (default: 'Cancelar')
- `showCancel?: boolean` - Mostrar botón de cancelar (default: false)

**Ejemplo de uso:**
```tsx
import AlertModal from '@/components/ui/AlertModal'

function MyComponent() {
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' })

  return (
    <>
      <button onClick={() => setAlert({ isOpen: true, type: 'success', title: 'Éxito', message: 'Operación completada' })}>
        Mostrar éxito
      </button>
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </>
  )
}
```

### Hook useAlertModal

Hook personalizado que facilita el uso de AlertModal en cualquier componente.

**Métodos:**
- `showSuccess(title: string, message: string)` - Mostrar alerta de éxito
- `showError(title: string, message: string)` - Mostrar alerta de error
- `showWarning(title: string, message: string)` - Mostrar alerta de advertencia
- `showInfo(title: string, message: string)` - Mostrar alerta informativa
- `showAlert(type: AlertType, title: string, message: string)` - Mostrar alerta genérica
- `closeAlert()` - Cerrar la alerta
- `AlertModalComponent` - Componente del modal que debes renderizar

**Ejemplo de uso:**
```tsx
import { useAlertModal } from '@/hooks/useAlertModal'

function MyComponent() {
  const { showSuccess, showError, AlertModalComponent } = useAlertModal()

  const handleSave = async () => {
    try {
      // ... lógica de guardado
      showSuccess('¡Guardado!', 'Los datos se guardaron correctamente.')
    } catch (error) {
      showError('Error', 'No se pudieron guardar los datos.')
    }
  }

  return (
    <>
      <button onClick={handleSave}>Guardar</button>
      <AlertModalComponent />
    </>
  )
}
```

### Características

- ✅ Estética consistente con la marca Rosita
- ✅ Gradiente característico (#BF5065 → #D98E04)
- ✅ Tipografías: Playfair Display (títulos) e Inter (texto)
- ✅ Responsive y mobile-first
- ✅ Animaciones suaves
- ✅ Cierre con ESC
- ✅ Prevención de scroll del body cuando está abierto
- ✅ Accesible (aria-labels)

