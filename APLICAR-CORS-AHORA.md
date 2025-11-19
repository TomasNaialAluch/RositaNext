# 🚀 APLICAR CORS - INSTRUCCIONES DIRECTAS

Tu archivo `cors.json` ya está perfecto. Solo necesitas aplicarlo al bucket.

## ✅ OPCIÓN 1: Usando Google Cloud Console (MÁS FÁCIL)

### Paso 1: Habilitar Storage API
1. Ve a: https://console.cloud.google.com/apis/library/storage-api.googleapis.com?project=rosita-b76eb
2. Haz clic en **"Enable"** o **"Habilitar"**

### Paso 2: Ir al bucket
1. Ve a: https://console.cloud.google.com/storage/browser?project=rosita-b76eb
2. Si no ves el bucket `rosita-b76eb.appspot.com`, primero habilítalo desde Firebase Console:
   - https://console.firebase.google.com/project/rosita-b76eb/storage
   - Haz clic en "Get started" si aparece

### Paso 3: Configurar CORS
1. Haz clic en el bucket: `rosita-b76eb.appspot.com`
2. Ve a la pestaña **"Configuration"**
3. Desplázate hasta **"CORS configuration"**
4. Haz clic en **"Edit"**
5. **Borra todo** y pega esto:

```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "https://rosita-b76eb.firebaseapp.com",
      "https://rosita-b76eb.web.app"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "x-goog-resumable",
      "x-goog-upload-command",
      "x-goog-upload-protocol",
      "x-goog-upload-status"
    ],
    "maxAgeSeconds": 3600
  }
]
```

6. Haz clic en **"Save"**

---

## ✅ OPCIÓN 2: Instalar Google Cloud SDK y usar gsutil

### Paso 1: Instalar Google Cloud SDK
1. Descarga: https://cloud.google.com/sdk/docs/install
2. Instala el SDK (incluye gsutil)

### Paso 2: Autenticarte
```bash
gcloud auth login
gcloud config set project rosita-b76eb
```

### Paso 3: Aplicar CORS
```bash
cd C:\Users\Naial\Downloads\RositaNext
gsutil cors set cors.json gs://rosita-b76eb.appspot.com
```

---

## ✅ OPCIÓN 3: Usar Firebase CLI con credenciales

### Paso 1: Generar credenciales de servicio
1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/settings/serviceaccounts/adminsdk
2. Haz clic en **"Generate new private key"**
3. Guarda el archivo JSON (ej: `firebase-key.json`)

### Paso 2: Configurar variable de entorno
```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Naial\Downloads\RositaNext\firebase-key.json
```

### Paso 3: Ejecutar script
```bash
npm run configurar-cors
```

---

## 🔍 VERIFICAR QUE FUNCIONÓ

1. **Espera 2-3 minutos** después de aplicar CORS
2. Recarga la página del admin
3. Intenta subir una imagen
4. Si aún falla, espera otros 2-3 minutos (los cambios pueden tardar)

---

## 📝 NOTA IMPORTANTE

- El bucket debe existir primero. Si no existe, habilítalo desde Firebase Console
- Los cambios de CORS pueden tardar hasta 5 minutos en aplicarse
- Asegúrate de que el JSON esté bien formateado (sin comas extra al final)

