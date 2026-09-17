import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 valida `quality` contra esta lista: cualquier valor que no esté
    // acá devuelve 400 (INVALID_IMAGE_OPTIMIZE_REQUEST) y el `quality` del
    // componente se ignora. 90 es el de las placas del carrusel, que ya se
    // estiran y no aguantan una segunda pasada de compresión; 75 sigue siendo
    // el default del resto del sitio.
    qualities: [75, 90],
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
