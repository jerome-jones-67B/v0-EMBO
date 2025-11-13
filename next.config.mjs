/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for static hosting
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable features that don't work with static export
  trailingSlash: true,
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Force webpack to resolve modules properly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './.',
      '@/components': './components',
      '@/lib': './lib',
      '@/hooks': './hooks',
    }

    // Ensure file extensions are resolved properly
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx', '.json']

    return config
  },
}

export default nextConfig
