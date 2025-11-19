#!/usr/bin/env node

/**
 * Script simplificado que intenta usar gsutil directamente
 * Si gsutil no está disponible, muestra instrucciones
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BUCKET_NAME = 'rosita-b76eb.appspot.com'
const CORS_FILE = join(__dirname, '..', 'cors.json')

// Rutas comunes donde puede estar gsutil en Windows
const GSUTIL_PATHS = [
  'gsutil',
  'gsutil.cmd',
  process.env.PROGRAMFILES + '\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gsutil.cmd',
  process.env.LOCALAPPDATA + '\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gsutil.cmd',
  process.env.USERPROFILE + '\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gsutil.cmd'
]

function findGsutil() {
  for (const path of GSUTIL_PATHS) {
    try {
      if (path.includes('\\') && existsSync(path)) {
        return path
      }
      // Intentar ejecutar para ver si está en PATH
      execSync(`"${path}" version`, { stdio: 'ignore' })
      return path
    } catch (e) {
      // Continuar buscando
    }
  }
  return null
}

async function setupCORS() {
  console.log('🚀 Configurando CORS para Firebase Storage...\n')

  const gsutilPath = findGsutil()

  if (!gsutilPath) {
    console.log('❌ gsutil no se encontró en el sistema.\n')
    console.log('📋 OPCIONES PARA CONFIGURAR CORS:\n')
    console.log('OPCIÓN 1: Instalar Google Cloud SDK')
    console.log('   1. Descarga: https://cloud.google.com/sdk/docs/install')
    console.log('   2. Instala el SDK')
    console.log('   3. Ejecuta: gcloud auth login')
    console.log('   4. Ejecuta: gcloud config set project rosita-b76eb')
    console.log('   5. Ejecuta: gsutil cors set cors.json gs://rosita-b76eb.appspot.com\n')
    
    console.log('OPCIÓN 2: Desde Google Cloud Console (Más fácil)')
    console.log('   1. Ve a: https://console.cloud.google.com/storage/browser/rosita-b76eb.appspot.com')
    console.log('   2. Haz clic en el bucket: rosita-b76eb.appspot.com')
    console.log('   3. Ve a la pestaña "Configuration"')
    console.log('   4. En "CORS", haz clic en "Edit"')
    console.log('   5. Pega este contenido:\n')
    console.log(readFileSync(CORS_FILE, 'utf8'))
    console.log('\n   6. Guarda los cambios\n')
    
    console.log('OPCIÓN 3: Configurar credenciales para el script')
    console.log('   1. Ejecuta: gcloud auth application-default login')
    console.log('   2. Ejecuta: npm run setup-cors\n')
    
    process.exit(1)
  }

  try {
    console.log(`✅ gsutil encontrado: ${gsutilPath}\n`)
    console.log('📋 Configuración CORS que se aplicará:')
    console.log(readFileSync(CORS_FILE, 'utf8'))
    console.log('\n')

    // Verificar autenticación
    try {
      execSync(`"${gsutilPath}" ls`, { stdio: 'ignore' })
    } catch (e) {
      console.log('⚠️  No estás autenticado. Ejecutando autenticación...\n')
      console.log('Por favor, sigue las instrucciones en la ventana del navegador que se abrirá.\n')
      execSync('gcloud auth login', { stdio: 'inherit' })
      execSync('gcloud config set project rosita-b76eb', { stdio: 'inherit' })
    }

    console.log('🔧 Configurando CORS...\n')
    execSync(`"${gsutilPath}" cors set "${CORS_FILE}" gs://${BUCKET_NAME}`, { stdio: 'inherit' })

    console.log('\n✅ CORS configurado exitosamente!')
    console.log('📝 Nota: Los cambios pueden tardar 2-3 minutos en aplicarse.')
    console.log('   Si aún tienes problemas, espera unos minutos y prueba de nuevo.\n')

  } catch (error) {
    console.error('\n❌ Error al configurar CORS:', error.message)
    console.error('\n💡 Asegúrate de:')
    console.error('   1. Estar autenticado: gcloud auth login')
    console.error('   2. Tener permisos en el proyecto: rosita-b76eb')
    console.error('   3. Que el bucket exista: rosita-b76eb.appspot.com\n')
    process.exit(1)
  }
}

setupCORS()

