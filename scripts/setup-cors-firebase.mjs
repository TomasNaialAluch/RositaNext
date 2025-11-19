#!/usr/bin/env node

/**
 * Script que intenta usar Firebase CLI para configurar CORS
 * Requiere: firebase-tools instalado y autenticado
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BUCKET_NAME = 'rosita-b76eb.appspot.com'
const CORS_FILE = join(__dirname, '..', 'cors.json')

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function checkGsutil() {
  const paths = [
    'gsutil',
    'gsutil.cmd',
    process.env.LOCALAPPDATA + '\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gsutil.cmd',
    process.env.USERPROFILE + '\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gsutil.cmd'
  ]
  
  for (const path of paths) {
    try {
      if (path.includes('\\')) {
        const { existsSync } = require('fs')
        if (existsSync(path)) return path
      }
      execSync(`"${path}" version`, { stdio: 'ignore' })
      return path
    } catch {}
  }
  return null
}

async function setupCORS() {
  console.log('🚀 Configurando CORS para Firebase Storage...\n')

  // Verificar Firebase CLI
  if (!checkFirebaseCLI()) {
    console.log('❌ Firebase CLI no está instalado.\n')
    console.log('💡 Instala Firebase CLI:')
    console.log('   npm install -g firebase-tools\n')
    console.log('📋 O usa la Opción A del archivo CONFIGURAR-CORS.md (Google Cloud Console)\n')
    process.exit(1)
  }

  // Verificar autenticación
  try {
    execSync('firebase projects:list', { stdio: 'ignore' })
  } catch {
    console.log('⚠️  No estás autenticado en Firebase.\n')
    console.log('🔐 Autenticando...\n')
    try {
      execSync('firebase login', { stdio: 'inherit' })
    } catch {
      console.log('\n❌ Error en la autenticación.')
      console.log('💡 Intenta manualmente: firebase login\n')
      process.exit(1)
    }
  }

  // Buscar gsutil
  const gsutilPath = checkGsutil()
  
  if (!gsutilPath) {
    console.log('❌ gsutil no se encontró.\n')
    console.log('📋 OPCIONES:\n')
    console.log('1. Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install')
    console.log('2. O usa la consola web: https://console.cloud.google.com/storage/browser/rosita-b76eb.appspot.com\n')
    console.log('📄 Contenido de cors.json que necesitas pegar:\n')
    console.log(readFileSync(CORS_FILE, 'utf8'))
    process.exit(1)
  }

  try {
    console.log(`✅ gsutil encontrado: ${gsutilPath}\n`)
    console.log('📋 Configuración CORS:')
    console.log(readFileSync(CORS_FILE, 'utf8'))
    console.log('\n🔧 Configurando CORS...\n')

    execSync(`"${gsutilPath}" cors set "${CORS_FILE}" gs://${BUCKET_NAME}`, { stdio: 'inherit' })

    console.log('\n✅ CORS configurado exitosamente!')
    console.log('📝 Espera 2-3 minutos y prueba subir una imagen.\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\n💡 SOLUCIÓN ALTERNATIVA:')
    console.error('   Usa la consola web: https://console.cloud.google.com/storage/browser/rosita-b76eb.appspot.com')
    console.error('   Ve a Configuration > CORS > Edit')
    console.error('   Pega el contenido de cors.json\n')
    process.exit(1)
  }
}

setupCORS()

