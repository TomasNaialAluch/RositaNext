const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar transporter de email
// Para Gmail, necesitas una "App Password" en lugar de tu contraseña normal
// Ve a: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

// Template HTML para el email de Rosita
function getEmailTemplate(code, email) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - Rosita</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header con gradiente Rosita -->
          <tr>
            <td style="background: linear-gradient(135deg, #BF5065 0%, #D98E04 100%); padding: 40px 30px; text-align: center;">
              <h1 style="font-family: 'Playfair Display', serif; color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                Rosita
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                Carnicería Premium
              </p>
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="font-family: 'Playfair Display', serif; color: #0C0D0E; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">
                Código de Verificación
              </h2>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hola,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta <strong>${email}</strong>.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Tu código de verificación es:
              </p>
              
              <!-- Código destacado -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div style="background: linear-gradient(135deg, #BF5065 0%, #D98E04 100%); border-radius: 8px; padding: 20px; display: inline-block;">
                      <span style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 600; color: #ffffff; letter-spacing: 8px;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                ⏱️ Este código expira en <strong>10 minutos</strong>.
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este código, podés ignorar este email de forma segura.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                <strong style="color: #BF5065;">Rosita</strong> - Tradición familiar desde 1950
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                4 generaciones de calidad y pasión
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer externo -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un email automático, por favor no respondas.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Función para enviar código de verificación
exports.sendPasswordResetCode = functions.https.onCall(async (data, context) => {
  const { email, code } = data;
  
  // Validar datos
  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email y código son requeridos');
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Email inválido');
  }
  
  const mailOptions = {
    from: `"Rosita Team" <${functions.config().email.user}>`,
    to: email,
    subject: '🔐 Código de Verificación - Recuperación de Contraseña',
    html: getEmailTemplate(code, email),
    text: `Tu código de verificación de Rosita es: ${code}\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este código, podés ignorar este email.`
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${email}`);
    return { success: true, message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new functions.https.HttpsError('internal', 'Error al enviar el email');
  }
});

// Función para resetear contraseña después de verificar el código
exports.resetPassword = functions.https.onCall(async (data, context) => {
  const { email, code, newPassword } = data;
  
  // Validar datos
  if (!email || !code || !newPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, código y nueva contraseña son requeridos');
  }
  
  // Validar longitud de contraseña
  if (newPassword.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'La contraseña debe tener al menos 6 caracteres');
  }
  
  try {
    // Verificar el código en Firestore
    const codeRef = admin.firestore().doc(`passwordResetCodes/${email}`);
    const codeDoc = await codeRef.get();
    
    if (!codeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Código no encontrado o expirado');
    }
    
    const codeData = codeDoc.data();
    const expiresAt = codeData.expiresAt?.toDate();
    
    // Verificar expiración
    if (expiresAt && expiresAt < new Date()) {
      await codeRef.delete();
      throw new functions.https.HttpsError('deadline-exceeded', 'El código ha expirado');
    }
    
    // Verificar que el código fue verificado
    if (!codeData.verified) {
      throw new functions.https.HttpsError('failed-precondition', 'El código no ha sido verificado');
    }
    
    // Verificar si ya fue usado
    if (codeData.used) {
      throw new functions.https.HttpsError('failed-precondition', 'Este código ya fue utilizado');
    }
    
    // Verificar que el código coincida
    if (codeData.code !== code) {
      throw new functions.https.HttpsError('invalid-argument', 'Código incorrecto');
    }
    
    // Resetear contraseña usando Admin SDK
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'No existe una cuenta con este email');
      }
      throw authError;
    }
    
    await admin.auth().updateUser(user.uid, { password: newPassword });
    
    // Marcar código como usado
    await codeRef.update({ used: true });
    
    console.log(`Contraseña reseteada para usuario ${email}`);
    return { success: true, message: 'Contraseña reseteada correctamente' };
    
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    
    // Si es un error de HttpsError, re-lanzarlo
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error al resetear la contraseña');
  }
});


