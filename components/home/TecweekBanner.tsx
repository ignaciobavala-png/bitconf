"use client";

import Image from "next/image";
import Reveal from "@/components/home/Reveal";
import { bgOpacity } from "@/lib/ui/bg";

// Pieza "Ventanas 2" de la organización (19/10/2026): Tecweek Buenos Aires x
// LABITCONF, entre Cronograma y Sponsors. Es un PNG con alfa, así que el
// fondo en movimiento (fondo1.mp4, el mismo clip de Media Partners) se ve a
// través de los huecos entre ventanas. Opacidad alta a propósito (19/10: a 0.18
// no se notaba): acá el video es parte de la pieza, no un fondo de lectura. "Pegarla" tal cual, sin retocarla.
const BG_VIDEO_SRC =
  "https://cryexzchtnerqkcchboj.supabase.co/storage/v1/object/public/media/home/media-partners-bg.mp4";

// La pieza es texto horneado en español y igual en ambos idiomas; el alt no cambia.
export default function TecweekBanner() {
  const alt = "Tecweek Buenos Aires x LABITCONF";

  return (
    <section
      id="tecweek"
      aria-label={alt}
      className="relative overflow-hidden px-6 sm:px-10 py-16 sm:py-24"
      style={{ zIndex: 3 }}
    >
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0, opacity: bgOpacity(0.55) }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={BG_VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, #000 100%)",
        }}
      />

      <Reveal className="relative mx-auto w-full max-w-5xl" style={{ zIndex: 2 }}>
        <Image
          src="/assets/home/ventanas-tecweek.png"
          alt={alt}
          width={2000}
          height={970}
          sizes="(min-width: 1024px) 1024px, 100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </Reveal>
    </section>
  );
}
