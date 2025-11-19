# 🔧 SOLUCIÓN: Configurar CORS en Firebase Storage

## ⚠️ PROBLEMA
El bucket no aparece en Google Cloud Console porque Firebase Storage se gestiona desde **Firebase Console**, no desde Google Cloud Console.

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Ve a Firebase Console

1. **Abre este enlace:**
   ```
   https://console.firebase.google.com/project/rosita-b76eb/storage
   ```

2. **Si te pide login, inicia sesión con tu cuenta de Google**

### Paso 2: Habilita Firebase Storage (si no está habilitado)

1. Si ves un botón **"Get started"** o **"Comenzar"**, haz clic en él
2. Selecciona **"Start in test mode"** o **"Comenzar en modo de prueba"**
3. Selecciona una ubicación (ej: `us-central` o `southamerica-east1`)
4. Haz clic en **"Done"** o **"Listo"**

### Paso 3: Configura CORS desde Firebase CLI

Una vez que Storage esté habilitado, usa la terminal:

```bash
# 1. Asegúrate de estar en el directorio del proyecto
cd C:\Users\Naial\Downloads\RositaNext

# 2. Autentícate en Firebase (si no lo has hecho)
firebase login

# 3. Configura CORS usando gsutil
# Primero verifica si tienes gsutil instalado
gsutil cors set cors.json gs://rosita-b76eb.appspot.com
```

### Paso 4: Si no tienes gsutil instalado

**Opción A: Instalar Google Cloud SDK**
1. Descarga: https://cloud.google.com/sdk/docs/install
2. Instala el SDK
3. Ejecuta: `gcloud auth login`
4. Ejecuta: `gsutil cors set cors.json gs://rosita-b76eb.appspot.com`

**Opción B: Usar Firebase CLI con credenciales de servicio**
1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/settings/serviceaccounts/adminsdk
2. Haz clic en **"Generate new private key"**
3. Guarda el archivo JSON (ej: `firebase-service-account.json`)
4. Ejecuta el script: `npm run setup-cors-admin`

---

## 🔍 VERIFICAR QUE FUNCIONÓ

1. Espera 2-3 minutos después de configurar CORS
2. Recarga la página del admin
3. Intenta subir una imagen
4. Si aún falla, espera otros 2-3 minutos

---

## 📝 NOTA IMPORTANTE

- Firebase Storage se crea automáticamente cuando lo usas por primera vez
- El bucket puede tardar unos minutos en aparecer en las consolas
- Los cambios de CORS pueden tardar hasta 5 minutos en aplicarse

