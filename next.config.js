/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimizaciones para SEO y rendimiento
  compress: true,
  poweredByHeader: false,
  // Configuración para Firebase Hosting - export estático para mejor SEO
  output: 'export', // Habilitado para producción
  trailingSlash: true,
  // Configuración de imágenes (desactivado para export estático)
  images: {
    unoptimized: true, // Necesario para export estático
  },
  // Configuración de webpack para manejar mejor Firebase
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

