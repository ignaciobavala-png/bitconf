import type { LogoItem } from "@/components/home/LogoMarquee";

/**
 * Content Partners y Partners LABITCONF (pedido de la organización, 27/10/2026).
 * Cada uno tiene su propia sección en la home, debajo de Media Partners.
 *
 * El orden es el del listado que mandó la organización (el de la planilla).
 */

// Mismo criterio que los sponsors: el logo ocupa 0.72 de su caja, multiplicado
// por la compensación óptica de cada uno. Los cuadrados o apilados (M2, POW,
// Whabbit, Fardo) llevan menos: con la misma caja pesarían el doble que un
// wordmark ancho.
const FILL = 0.72;
const p = (file: string, alt: string, k = 1): LogoItem => ({
  src: `/assets/home/partners/${file}.png`,
  alt,
  scale: FILL * k,
});

export const CONTENT_PARTNERS: LogoItem[] = [
  { src: "/assets/home/content-partners/bitcoin-ar.png", alt: "Bitcoin.ar" },
  { src: "/assets/home/content-partners/la-crypta.png", alt: "La Crypta" },
  { src: "/assets/home/content-partners/codemia.png", alt: "Codemia" },
];

const PARTNERS: LogoItem[] = [
  p("whabbit", "Whabbit", 1.1),
  p("orbita", "Órbita Comms", 1.1),
  p("oxigeno", "Oxígeno", 1),
  p("picante", "Picante", 0.9),
  p("fardo", "Fardo", 1),
  p("paisanos", "Paisanos", 0.8),
  p("m2", "M2", 1.15),
  p("pow", "POW", 1.6),
  p("bitnaria", "Bitnaria", 0.85),
  p("humai", "HUMAI", 1),
  p("colossus-lab", "Colossus Lab", 0.85),
  p("huerta", "Huerta", 1),
  p("zentra", "Zentra", 1.05),
  p("camara-fintech-chile", "Cámara Fintech Chile", 0.9),
];

// Dos carriles con siete logos cada uno: la 1ª mitad del listado arriba y la
// 2ª abajo, para que cada carril entre más o menos en una pantalla.
export const PARTNER_LANES: [LogoItem[], LogoItem[]] = [
  PARTNERS.slice(0, 7),
  PARTNERS.slice(7),
];
