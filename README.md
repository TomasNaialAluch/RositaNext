# Rosita - Tienda Online

Tienda online desarrollada con Next.js, optimizada para SEO y mobile-first, desplegada en Firebase Hosting.

## 🎨 Identidad de Marca

### Paleta de Colores

La paleta completa de Rosita Carnicería:

| Color | Hex | Uso |
|-------|-----|-----|
| **Rosa** | `#BF5065` | Color principal de marca, botones, acentos |
| **Naranja** | `#D98E04` | Color secundario, gradientes, destacados |
| **Marrón** | `#BF946F` | Color terciario, elementos de apoyo |
| **Rojo** | `#BC1304` | Alertas, elementos críticos |
| **Negro** | `#0C0D0E` | Texto principal, contraste |

**Ejemplo de uso en CSS:**
```css
/* Color principal */
.primary-color { color: #BF5065; }

/* Gradiente característico */
.gradient-brand {
  background: linear-gradient(135deg, #BF5065 0%, #D98E04 100%);
}
```

### Tipografías

**1. Playfair Display** (Google Fonts)
- **Uso**: Títulos principales y encabezados (H1, H2, H3)
- **Estilo**: Serif elegante
- **Propósito**: Transmitir tradición y calidad premium
- **URL**: https://fonts.google.com/specimen/Playfair+Display

**2. Inter** (Google Fonts)
- **Uso**: Texto general (párrafos, botones, navegación)
- **Estilo**: Sans-serif moderna
- **Propósito**: Legibilidad en pantalla
- **URL**: https://fonts.google.com/specimen/Inter

**Aplicación en código:**
```css
/* Títulos */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
}

/* Texto general */
body, p, button, a {
  font-family: 'Inter', sans-serif;
}
```

### Tono Comunicacional

#### Características Principales

1. **Cálido y familiar**
   - Ejemplos: "¡Bienvenido a Rosita! 👋", "Únete a más de 1,000 familias que confían en nosotros"
   - "Estamos aquí para ayudarte"
   - "Cada cliente es parte de nuestra familia"

2. **Tradicional con toque moderno**
   - "4 generaciones de tradición familiar"
   - "Desde 1985, la tradición continúa"
   - "Nuestra abuela Rosita, con sus 92 años, sigue siendo nuestra inspiración"

3. **Argentino (voseo)**
   - "buscás", "tenés", "Decime"
   - "La mejor carne de Buenos Aires"
   - "Carnes argentinas"

4. **Premium pero accesible**
   - "Carnicería Premium"
   - "Calidad premium"
   - "Cortes selectos"
   - Sin ser elitista

5. **Emocional y cercano**
   - "con amor y dedicación"
   - "Tu satisfacción es nuestro mayor logro"
   - "La calidad no tiene precio"

6. **Uso estratégico de emojis**
   - 👋, 🚚, ✅, 🥩
   - Sin exceso

7. **Confianza y credibilidad**
   - "Certificación 5 estrellas"
   - "500+ reseñas"
   - "+2000 clientes satisfechos"
   - "Más de 35 años"

#### Resumen del Tono

- **Registro**: Informal-cercano, con respeto
- **Personalidad**: Cálida, familiar, tradicional, confiable
- **Objetivo**: Transmitir confianza, calidad y cercanía
- **Público**: Familias argentinas que valoran tradición y calidad

#### Palabras Clave que Definen el Tono

- Tradición
- Familia
- Calidad
- Confianza
- Cercanía
- Experiencia
- Pasión

**En síntesis**: El tono es cálido, familiar y premium, con un enfoque en la tradición y la calidad, usando un lenguaje cercano que construye confianza.

---

## 🚀 Características Técnicas

- ✅ Next.js 14 con App Router
- ✅ TypeScript para type safety
- ✅ Mobile-first design
- ✅ SEO optimizado
- ✅ Firebase configurado e integrado
- ✅ Firebase Analytics integrado
- ✅ Configurado para Firebase Hosting
- ✅ PWA ready (manifest.json incluido)
- ✅ Performance optimizado

## 📦 Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Firebase ya está configurado:
   - La configuración de Firebase está en `lib/firebase.ts`
   - El proyecto ID está configurado en `.firebaserc`
   - Las URLs de metadata están actualizadas en `app/layout.tsx`

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Build y Deploy

### Build para producción:
```bash
npm run build
```

Esto generará la carpeta `out/` con los archivos estáticos.

### Deploy a Firebase:

1. Instala Firebase CLI si no lo tienes:
```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:
```bash
firebase login
```

3. Inicializa Firebase (si es la primera vez):
```bash
firebase init hosting
```

4. Despliega:
```bash
firebase deploy --only hosting
```

## 📝 Notas Importantes

- **Imágenes**: Agrega tus propias imágenes en la carpeta `public/`
  - `favicon.ico`
  - `apple-touch-icon.png`
  - `og-image.jpg` (1200x630px para Open Graph)
  - `icon-192x192.png` y `icon-512x512.png` para PWA
  - Imágenes de productos

- **Metadata**: Actualiza la información en `app/layout.tsx` con tus datos reales

- **Productos**: Reemplaza los productos de ejemplo en `components/ProductGrid.tsx` con tus datos reales

## 🎨 Personalización

- Estilos globales: `app/globals.css`
- Componentes: `components/`
- Páginas: `app/`

## 📱 Mobile First

El diseño está completamente optimizado para móviles primero, con breakpoints responsivos:
- Mobile: base (hasta 640px)
- Tablet: 640px+
- Desktop: 1024px+
- Desktop grande: 1280px+

## 🔍 SEO

- Metadata completa configurada
- Open Graph tags
- Twitter Cards
- Schema.org ready
- Sitemap automático generado
- URLs configuradas para: `https://rosita-b76eb.firebaseapp.com`

## 🔥 Firebase

- Firebase SDK configurado en `lib/firebase.ts`
- Firebase Analytics integrado automáticamente
- Proyecto: `rosita-b76eb`
- Dominio: `https://rosita-b76eb.firebaseapp.com`

### Uso de Analytics

Firebase Analytics está integrado automáticamente y registra eventos de vista de página. Para agregar eventos personalizados, importa `analytics` desde `lib/firebase.ts`:

```typescript
import { analytics } from '@/lib/firebase'
import { logEvent } from 'firebase/analytics'

// Ejemplo de evento personalizado
if (analytics) {
  logEvent(analytics, 'add_to_cart', {
    item_name: 'Producto',
    value: 29.99
  })
}
```
