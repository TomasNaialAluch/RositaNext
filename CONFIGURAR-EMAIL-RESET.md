# Configuración de Email para Recuperación de Contraseña

## ✅ Estado Actual

El sistema de recuperación de contraseña está **completamente implementado** con:

1. **Generación de código**: Se genera un código de 6 dígitos aleatorio
2. **Almacenamiento**: El código se guarda en Firestore con expiración de 10 minutos
3. **Verificación**: El usuario puede ingresar y verificar el código
4. **Reset de contraseña**: Después de verificar, puede ingresar una nueva contraseña
5. **Diseño de Rosita**: Template HTML con la estética de la marca (colores, tipografías, gradientes)

## 📧 Configuración para Producción

Las Cloud Functions ya están creadas con el diseño de Rosita. Solo necesitas configurarlas:

### Paso 1: Instalar dependencias

```bash
cd functions
npm install
```

### Paso 2: Configurar credenciales de email

Para Gmail, necesitas crear una "App Password":
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Configúrala en Firebase:

```bash
firebase functions:config:set email.user="tu-email@gmail.com" email.password="tu-app-password"
```

**⚠️ IMPORTANTE**: Usa una "App Password", NO tu contraseña normal de Gmail.

### Paso 3: Desplegar las funciones

```bash
firebase deploy --only functions
```

¡Listo! Ahora los emails se enviarán automáticamente con el diseño de Rosita.

## 🎨 Características del Email

El template incluye:
- ✅ Gradiente de marca (rosa #BF5065 a naranja #D98E04)
- ✅ Tipografía Playfair Display para títulos
- ✅ Tipografía Inter para texto
- ✅ Código destacado en un box con gradiente
- ✅ Diseño responsive
- ✅ Footer con información de la marca

## 📝 Funciones Implementadas

### 1. `sendPasswordResetCode`
Envía el código de 6 dígitos por email con diseño de Rosita.

**Parámetros:**
- `email`: Email del usuario
- `code`: Código de 6 dígitos

### 2. `resetPassword`
Resetea la contraseña después de verificar el código.

**Parámetros:**
- `email`: Email del usuario
- `code`: Código verificado
- `newPassword`: Nueva contraseña

## 🔄 Código del Cliente

El código del cliente ya está actualizado para usar las Cloud Functions. No necesitas hacer cambios adicionales.

## ⚠️ Notas Importantes

1. **Seguridad**: Las credenciales de email están en Firebase Functions Config, nunca en el código del cliente
2. **Rate Limiting**: Considera agregar límites de tasa para prevenir abuso
3. **Expiración**: Los códigos expiran automáticamente después de 10 minutos
4. **Limpieza**: Los códigos usados se marcan pero no se eliminan automáticamente

## 🧪 Testing en Desarrollo

Si las funciones no están desplegadas:
1. El código se mostrará en la consola del navegador (F12)
2. Puedes usar ese código para verificar
3. El reset de contraseña mostrará un mensaje informativo

## ✅ Checklist para Producción

- [x] Cloud Functions creadas con diseño de Rosita
- [x] Código del cliente actualizado
- [ ] Instalar dependencias en `functions/`
- [ ] Configurar credenciales de email (Gmail App Password)
- [ ] Desplegar funciones: `firebase deploy --only functions`
- [ ] Probar envío de email
- [ ] Probar verificación de código
- [ ] Probar reset de contraseña

## 🎯 Alternativas de Email

Si prefieres usar otro proveedor de email:

### SendGrid

1. Instala SendGrid:
```bash
cd functions
npm install @sendgrid/mail
```

2. Actualiza `functions/index.js` para usar SendGrid en lugar de Nodemailer

3. Configura la API key:
```bash
firebase functions:config:set sendgrid.key="tu-api-key"
```

### Otros proveedores

Puedes modificar el transporter en `functions/index.js` para usar cualquier proveedor compatible con Nodemailer.

## 📞 Soporte

Si tienes problemas:
1. Verifica que las funciones estén desplegadas: `firebase functions:list`
2. Revisa los logs: `firebase functions:log`
3. Verifica las credenciales: `firebase functions:config:get`
