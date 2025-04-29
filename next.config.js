/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT,
    NEXT_PUBLIC_PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY
  },
};

module.exports = nextConfig;
