# 🔧 CONFIGURAR CORS - PASOS RÁPIDOS

## ⚠️ PROBLEMA ACTUAL
El error de CORS indica que Firebase Storage no permite subidas desde `localhost:3000`. Necesitas configurar CORS manualmente.

## ✅ SOLUCIÓN RÁPIDA (5 minutos)

### Opción A: Google Cloud Console (MÁS FÁCIL - Recomendado)

1. **Abre este enlace directo:**
   ```
   https://console.cloud.google.com/storage/browser/rosita-b76eb.appspot.com?project=rosita-b76eb
   ```

2. **Si te pide login, inicia sesión con tu cuenta de Google**

3. **Haz clic en el bucket:** `rosita-b76eb.appspot.com`

4. **Ve a la pestaña "Configuration"** (Configuración)

5. **Desplázate hasta "CORS configuration"** y haz clic en **"Edit"** (Editar)

6. **Borra todo el contenido** y pega esto:

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

7. **Haz clic en "Save"** (Guardar)

8. **Espera 2-3 minutos** y prueba subir una imagen de nuevo

---

### Opción B: Usando Firebase CLI (si ya tienes gsutil)

```bash
# 1. Asegúrate de estar autenticado
firebase login

# 2. Configura CORS usando gsutil (si está instalado)
gsutil cors set cors.json gs://rosita-b76eb.appspot.com
```

---

### Opción C: Usando Google Cloud SDK

1. **Instala Google Cloud SDK:**
   - Windows: https://cloud.google.com/sdk/docs/install-sdk#windows
   - Mac: `brew install google-cloud-sdk`
   - Linux: https://cloud.google.com/sdk/docs/install-sdk#linux

2. **Autentícate:**
   ```bash
   gcloud auth login
   gcloud config set project rosita-b76eb
   ```

3. **Configura CORS:**
   ```bash
   gsutil cors set cors.json gs://rosita-b76eb.appspot.com
   ```

---

## 🔍 VERIFICAR QUE FUNCIONÓ

Después de configurar CORS:

1. Espera 2-3 minutos (los cambios pueden tardar en propagarse)
2. Recarga la página del admin
3. Intenta subir una imagen
4. Si aún falla, espera otros 2-3 minutos y prueba de nuevo

---

## 📝 NOTA IMPORTANTE

- Los cambios de CORS pueden tardar hasta 5 minutos en aplicarse
- Asegúrate de que el JSON esté bien formateado (sin comas extra)
- Si tienes problemas, verifica que tengas permisos de administrador en el proyecto Firebase

---

## 🆘 SI NADA FUNCIONA

1. Verifica que el bucket existe: `rosita-b76eb.appspot.com`
2. Verifica que tienes permisos de administrador en Firebase
3. Intenta desde otro navegador o modo incógnito
4. Limpia la caché del navegador (Ctrl+Shift+Delete)

