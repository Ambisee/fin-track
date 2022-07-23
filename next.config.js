/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE == 'true'
})

const nextConfig = {
  reactStrictMode: true,
  ...withBundleAnalyzer({})
}

module.exports = nextConfig
