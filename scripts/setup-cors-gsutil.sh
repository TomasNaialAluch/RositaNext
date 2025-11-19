#!/bin/bash

# Script alternativo usando gsutil para configurar CORS
# Requiere tener gsutil instalado (viene con Google Cloud SDK)

BUCKET_NAME="rosita-b76eb.appspot.com"
CORS_FILE="cors.json"

echo "🚀 Configurando CORS para Firebase Storage usando gsutil..."
echo "📦 Bucket: $BUCKET_NAME"

# Verificar si gsutil está instalado
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil no está instalado"
    echo "💡 Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "   O usa: npm run setup-cors (requiere credenciales configuradas)"
    exit 1
fi

# Configurar CORS
gsutil cors set "$CORS_FILE" "gs://$BUCKET_NAME"

if [ $? -eq 0 ]; then
    echo "✅ CORS configurado exitosamente!"
    echo "📝 Nota: Los cambios pueden tardar unos minutos en aplicarse."
else
    echo "❌ Error al configurar CORS"
    echo "💡 Asegúrate de estar autenticado: gcloud auth login"
    exit 1
fi

