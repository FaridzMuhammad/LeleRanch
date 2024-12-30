/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: "/api/:path*",
            destination: "https://103.127.138.198/api/:path*",
          },
        ];
      },
};

module.exports = nextConfig;
