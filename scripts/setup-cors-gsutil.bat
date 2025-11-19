@echo off
REM Script alternativo usando gsutil para configurar CORS en Windows
REM Requiere tener gsutil instalado (viene con Google Cloud SDK)

set BUCKET_NAME=rosita-b76eb.appspot.com
set CORS_FILE=cors.json

echo 🚀 Configurando CORS para Firebase Storage usando gsutil...
echo 📦 Bucket: %BUCKET_NAME%

REM Verificar si gsutil está instalado
where gsutil >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gsutil no está instalado
    echo 💡 Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install
    echo    O usa: npm run setup-cors (requiere credenciales configuradas)
    exit /b 1
)

REM Configurar CORS
gsutil cors set %CORS_FILE% gs://%BUCKET_NAME%

if %ERRORLEVEL% EQU 0 (
    echo ✅ CORS configurado exitosamente!
    echo 📝 Nota: Los cambios pueden tardar unos minutos en aplicarse.
) else (
    echo ❌ Error al configurar CORS
    echo 💡 Asegúrate de estar autenticado: gcloud auth login
    exit /b 1
)

