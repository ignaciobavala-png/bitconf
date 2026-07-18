import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de galería servidas desde el bucket público de Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cryexzchtnerqkcchboj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
