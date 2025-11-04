/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimizaciones para SEO y rendimiento
  compress: true,
  poweredByHeader: false,
  // Configuración para Firebase Hosting - export estático para mejor SEO
  output: 'export',
  trailingSlash: true,
  // Configuración de imágenes (desactivado para export estático)
  images: {
    unoptimized: true, // Necesario para export estático
  }
}

module.exports = nextConfig

