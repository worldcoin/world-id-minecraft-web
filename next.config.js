/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/', permanent: true, destination: 'https://worldcoin.org/apps/minecraft' },
    ]
  },
}

module.exports = nextConfig
