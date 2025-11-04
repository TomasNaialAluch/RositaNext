import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Rosita - Tienda Online',
    template: '%s | Rosita'
  },
  description: 'Descubre los mejores productos en nuestra tienda online. Envíos rápidos y seguros a todo el país.',
  keywords: ['tienda online', 'compras', 'productos', 'envío rápido'],
  authors: [{ name: 'Rosita' }],
  creator: 'Rosita',
  publisher: 'Rosita',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rosita-b76eb.firebaseapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://rosita-b76eb.firebaseapp.com',
    siteName: 'Rosita',
    title: 'Rosita - Tienda Online',
    description: 'Descubre los mejores productos en nuestra tienda online',
    images: [
      {
        url: '/images/logo-completo.png',
        width: 1200,
        height: 630,
        alt: 'Rosita - Tienda Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosita - Tienda Online',
    description: 'Descubre los mejores productos en nuestra tienda online',
    images: ['/images/logo-completo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#BF5065" />
        <link rel="icon" href="/images/logo-simple.png" />
        <link rel="apple-touch-icon" href="/images/logo-simple.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
