# 📧 Guía Paso a Paso: Configurar Email para Recuperación de Contraseña

## ✅ Lo que ya está hecho

- ✅ Dependencias instaladas en `functions/`
- ✅ Cloud Functions creadas con diseño de Rosita
- ✅ Código del cliente actualizado
- ✅ Firebase CLI configurado y logueado

## 🚀 Pasos para Configurar el Email

### Paso 1: Crear App Password de Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú lateral, haz clic en **"Seguridad"**
3. Busca la sección **"Acceso de aplicaciones menos seguras"** o **"Contraseñas de aplicaciones"**
4. Si no ves "Contraseñas de aplicaciones", primero activa la verificación en 2 pasos:
   - Ve a: https://myaccount.google.com/signinoptions/two-step-verification
   - Actívala si no está activada
5. Luego ve a: https://myaccount.google.com/apppasswords
6. Selecciona **"Correo"** como aplicación
7. Selecciona **"Otro (nombre personalizado)"** como dispositivo
8. Escribe: **"Rosita Firebase Functions"**
9. Haz clic en **"Generar"**
10. **Copia la contraseña de 16 caracteres** que aparece (la necesitarás en el siguiente paso)

### Paso 2: Configurar las Credenciales en Firebase

Tienes **DOS opciones**. Te recomiendo la **Opción A** (más fácil):

#### Opción A: Desde Firebase Console (Recomendado)

1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/functions/config
2. Haz clic en **"Agregar variable"** o **"Add variable"**
3. Agrega las siguientes variables:

   **Variable 1:**
   - Nombre: `email.user`
   - Valor: `tu-email@gmail.com` (reemplaza con tu email de Gmail)

   **Variable 2:**
   - Nombre: `email.password`
   - Valor: `xxxx xxxx xxxx xxxx` (la App Password de 16 caracteres que copiaste, sin espacios)

4. Haz clic en **"Guardar"** o **"Save"**

#### Opción B: Desde la Terminal (Alternativa)

Si prefieres usar la terminal, ejecuta estos comandos:

```bash
firebase functions:config:set email.user="tu-email@gmail.com" email.password="tu-app-password"
```

**Nota:** Reemplaza:
- `tu-email@gmail.com` con tu email real
- `tu-app-password` con la contraseña de aplicación de 16 caracteres (sin espacios)

### Paso 3: Desplegar las Functions

Una vez configuradas las credenciales, despliega las funciones:

```bash
firebase deploy --only functions
```

Este proceso puede tardar unos minutos. Verás algo como:

```
✔  functions[sendPasswordResetCode(us-central1)] Successful create operation.
✔  functions[resetPassword(us-central1)] Successful create operation.
```

### Paso 4: Verificar que Funcionen

1. Ve a: https://console.firebase.google.com/project/rosita-b76eb/functions
2. Deberías ver dos funciones:
   - `sendPasswordResetCode`
   - `resetPassword`
3. Ambas deben estar en estado **"Activo"** o **"Active"**

## 🧪 Probar el Sistema

1. Ve a tu aplicación: http://localhost:3000
2. Haz clic en **"Iniciar sesión"**
3. Haz clic en **"¿Olvidaste tu contraseña?"**
4. Ingresa un email válido
5. Revisa tu bandeja de entrada (y spam) - deberías recibir un email con el código de 6 dígitos con el diseño de Rosita

## ❌ Solución de Problemas

### Error: "functions/not-found"
- **Causa:** Las funciones no están desplegadas
- **Solución:** Ejecuta `firebase deploy --only functions`

### Error: "Error al enviar el email"
- **Causa:** Las credenciales no están configuradas correctamente
- **Solución:** 
  1. Verifica que las variables estén en Firebase Console
  2. Verifica que la App Password sea correcta (sin espacios)
  3. Verifica que el email tenga verificación en 2 pasos activada

### No recibo el email
- Revisa la carpeta de **Spam**
- Verifica que el email esté correcto
- Revisa los logs: `firebase functions:log`

### Ver logs de las funciones
```bash
firebase functions:log
```

## 📝 Notas Importantes

- ⚠️ **NUNCA** compartas tu App Password
- ⚠️ La App Password es diferente a tu contraseña normal de Gmail
- ✅ Los emails se enviarán automáticamente cuando un usuario solicite recuperación de contraseña
- ✅ El código expira en 10 minutos
- ✅ El diseño del email incluye la marca Rosita completa

## ✅ Checklist Final

- [ ] App Password de Gmail creada
- [ ] Credenciales configuradas en Firebase Console
- [ ] Functions desplegadas (`firebase deploy --only functions`)
- [ ] Funciones visibles en Firebase Console
- [ ] Email de prueba recibido con código de 6 dígitos
- [ ] Diseño del email muestra marca Rosita correctamente

## 🎉 ¡Listo!

Una vez completados estos pasos, el sistema de recuperación de contraseña funcionará completamente con emails automáticos con el diseño de Rosita.


