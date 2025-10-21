/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['bybyqffmijimwuubovrb.supabase.co'],
  },
}

module.exports = nextConfig