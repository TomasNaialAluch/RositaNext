export function maskEmail(email: string): string {
  if (!email) return ''
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  const visibleStart = localPart.substring(0, 2)
  const maskedMiddle = '*'.repeat(Math.min(localPart.length - 2, 3))
  return `${visibleStart}${maskedMiddle}@${domain}`
}

// Generar código de verificación de 6 dígitos
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

