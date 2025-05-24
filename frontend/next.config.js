// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api.dicebear.com',
          pathname: '/7.x/avataaars/svg**',
        },
      ],
      dangerouslyAllowSVG: true, // ⚠️ Attention : à utiliser avec précaution !
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
  };
  
  module.exports = nextConfig;
  