#!/usr/bin/env node

/**
 * Script para configurar CORS en Firebase Storage
 * 
 * Uso:
 *   node scripts/setup-cors.mjs
 * 
 * Requisitos:
 *   - Tener las credenciales de Google Cloud configuradas
 *   - Variable de entorno GOOGLE_APPLICATION_CREDENTIALS apuntando al archivo de credenciales
 *   - O tener gcloud configurado con: gcloud auth application-default login
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BUCKET_NAME = 'rosita-b76eb.appspot.com'
const PROJECT_ID = 'rosita-b76eb'

async function setupCORS() {
  try {
    console.log('🚀 Configurando CORS para Firebase Storage...')
    console.log(`📦 Bucket: ${BUCKET_NAME}`)

    // Leer configuración CORS
    const corsConfigPath = join(__dirname, '..', 'cors.json')
    const corsConfig = JSON.parse(readFileSync(corsConfigPath, 'utf8'))
    
    console.log('📋 Configuración CORS:')
    console.log(JSON.stringify(corsConfig, null, 2))

    // Inicializar Firebase Admin (usa credenciales por defecto o variables de entorno)
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          projectId: PROJECT_ID,
          storageBucket: BUCKET_NAME
        })
      } catch (error) {
        if (error.code === 'app/no-app') {
          admin.initializeApp({
            projectId: PROJECT_ID,
            storageBucket: BUCKET_NAME
          })
        } else {
          throw error
        }
      }
    }

    // Obtener bucket usando firebase-admin
    const bucket = admin.storage().bucket(BUCKET_NAME)

    // Verificar que el bucket existe
    const [exists] = await bucket.exists()
    if (!exists) {
      throw new Error(`El bucket ${BUCKET_NAME} no existe. Verifica el nombre del bucket.`)
    }

    // Configurar CORS usando la API de Google Cloud Storage
    await bucket.setCorsConfiguration(corsConfig)

    console.log('✅ CORS configurado exitosamente!')
    console.log('\n📝 Nota: Los cambios pueden tardar unos minutos en aplicarse.')
    console.log('   Si aún tienes problemas, espera 2-3 minutos y prueba de nuevo.')
    
  } catch (error) {
    console.error('❌ Error al configurar CORS:', error.message)
    
    if (error.message.includes('Could not load the default credentials')) {
      console.error('\n💡 Solución:')
      console.error('   1. Instala gcloud CLI: https://cloud.google.com/sdk/docs/install')
      console.error('   2. Ejecuta: gcloud auth application-default login')
      console.error('   3. O configura GOOGLE_APPLICATION_CREDENTIALS con la ruta a tu archivo de credenciales')
    } else if (error.message.includes('Permission denied')) {
      console.error('\n💡 Solución:')
      console.error('   Asegúrate de tener permisos de administrador en el proyecto Firebase')
    }
    
    process.exit(1)
  }
}

setupCORS()

