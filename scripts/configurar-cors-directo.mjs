#!/usr/bin/env node

/**
 * Script que configura CORS directamente usando Firebase Admin
 * Requiere: Credenciales de servicio de Firebase
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BUCKET_NAME = 'rosita-b76eb.appspot.com'
const PROJECT_ID = 'rosita-b76eb'
const CORS_FILE = join(__dirname, '..', 'cors.json')

async function setupCORS() {
  try {
    console.log('🚀 Configurando CORS para Firebase Storage...\n')

    // Leer configuración CORS
    const corsConfig = JSON.parse(readFileSync(CORS_FILE, 'utf8'))
    
    console.log('📋 Configuración CORS:')
    console.log(JSON.stringify(corsConfig, null, 2))
    console.log('\n')

    // Intentar inicializar Firebase Admin
    // Primero intenta con credenciales por defecto
    if (!admin.apps.length) {
      try {
        // Intenta usar Application Default Credentials
        admin.initializeApp({
          projectId: PROJECT_ID,
          storageBucket: BUCKET_NAME
        })
        console.log('✅ Firebase Admin inicializado\n')
      } catch (error) {
        console.error('❌ Error al inicializar Firebase Admin:', error.message)
        console.error('\n💡 SOLUCIÓN:')
        console.error('   1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/settings/serviceaccounts/adminsdk')
        console.error('   2. Haz clic en "Generate new private key"')
        console.error('   3. Guarda el archivo JSON')
        console.error('   4. Configura la variable de entorno:')
        console.error('      set GOOGLE_APPLICATION_CREDENTIALS=ruta\\al\\archivo.json')
        console.error('   5. O usa el método de Firebase Console (más fácil)\n')
        process.exit(1)
      }
    }

    // Obtener bucket
    const bucket = admin.storage().bucket(BUCKET_NAME)

    // Verificar que existe
    const [exists] = await bucket.exists()
    if (!exists) {
      console.log('⚠️  El bucket no existe todavía.')
      console.log('💡 Ve a Firebase Console y habilita Storage primero:')
      console.log('   https://console.firebase.google.com/project/rosita-b76eb/storage\n')
      process.exit(1)
    }

    console.log('✅ Bucket encontrado\n')
    console.log('🔧 Configurando CORS...\n')

    // Configurar CORS
    await bucket.setCorsConfiguration(corsConfig)

    console.log('✅ CORS configurado exitosamente!')
    console.log('📝 Espera 2-3 minutos y prueba subir una imagen.\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('Could not load the default credentials')) {
      console.error('\n💡 Necesitas credenciales de servicio:')
      console.error('   1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/settings/serviceaccounts/adminsdk')
      console.error('   2. Haz clic en "Generate new private key"')
      console.error('   3. Guarda el archivo y configura:')
      console.error('      set GOOGLE_APPLICATION_CREDENTIALS=ruta\\al\\archivo.json\n')
    } else if (error.message.includes('Permission denied')) {
      console.error('\n💡 No tienes permisos. Asegúrate de ser administrador del proyecto.\n')
    } else {
      console.error('\n💡 SOLUCIÓN ALTERNATIVA (MÁS FÁCIL):')
      console.error('   Usa Firebase Console para habilitar Storage y luego:')
      console.error('   1. Instala Google Cloud SDK')
      console.error('   2. Ejecuta: gsutil cors set cors.json gs://rosita-b76eb.appspot.com\n')
    }
    
    process.exit(1)
  }
}

setupCORS()

