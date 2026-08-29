import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo desarrollo: sin esto, abrir el dev server desde el celular por la IP
  // de la red LAN funciona pero el hot reload queda bloqueado. No tiene ningún
  // efecto en producción. Si cambia la IP que da el router, se actualiza acá.
  allowedDevOrigins: ["192.168.0.78"],
  // /comunidad era la página única de la fase anterior. En el mapa de fase 2
  // ese contenido se repartió en /mas/hub, /mas/embajadores y /mas/comunidades;
  // el link viejo puede estar compartido, así que va a 308 al índice de MÁS.
  async redirects() {
    return [{ source: "/comunidad", destination: "/mas", permanent: true }];
  },
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
