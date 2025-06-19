const nextConfig = {
  images: {
    domains: ["tournament-production-4613.up.railway.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tournament-production-4613.up.railway.app",
        pathname: "/api/images/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
