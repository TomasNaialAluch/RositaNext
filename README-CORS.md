# Configuración de CORS para Firebase Storage

Este proyecto necesita configurar CORS en Firebase Storage para permitir subidas de imágenes desde el navegador.

## Método 1: Usando gsutil (Recomendado)

Si tienes Google Cloud SDK instalado:

### Windows:
```bash
# Si gsutil está en el PATH
gsutil cors set cors.json gs://rosita-b76eb.appspot.com

# O si está en la ubicación por defecto
"C:\Users\%USERNAME%\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gsutil.cmd" cors set cors.json gs://rosita-b76eb.appspot.com
```

### Linux/Mac:
```bash
gsutil cors set cors.json gs://rosita-b76eb.appspot.com
```

**Primero autentícate:**
```bash
gcloud auth login
gcloud config set project rosita-b76eb
```

## Método 2: Usando el script de Node.js

```bash
npm run setup-cors
```

**Requisitos:**
- Tener credenciales de Google Cloud configuradas
- Ejecutar: `gcloud auth application-default login`
- O configurar la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS`

## Método 3: Desde la Consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `rosita-b76eb`
3. Ve a **Storage** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. No hay interfaz directa para CORS, pero puedes usar gsutil

## Método 4: Usando Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `rosita-b76eb`
3. Ve a **Cloud Storage** > **Buckets**
4. Haz clic en el bucket: `rosita-b76eb.appspot.com`
5. Ve a la pestaña **Configuration**
6. En **CORS**, haz clic en **Edit**
7. Pega el contenido de `cors.json` y guarda

## Verificar que funciona

Después de configurar CORS, espera 2-3 minutos y prueba subir una imagen desde la aplicación.

Si aún tienes problemas:
1. Verifica que el archivo `cors.json` tiene los orígenes correctos
2. Asegúrate de que el bucket existe y tienes permisos
3. Espera unos minutos más (los cambios pueden tardar en propagarse)

