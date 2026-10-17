import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo desarrollo: sin esto, abrir el dev server desde el celular por la IP
  // de la red LAN funciona pero el hot reload queda bloqueado. No tiene ningún
  // efecto en producción. Si cambia la IP que da el router, se actualiza acá.
  allowedDevOrigins: ["192.168.0.78"],
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
      // Fotos de speakers que publica la app de la organización (Firebase Storage).
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/labitconf-2026.*/o/**",
      },
    ],
  },
};

export default nextConfig;
