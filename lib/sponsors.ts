/**
 * Sponsors — filas por tier, de la más grande a la más chica.
 *
 * Logos de `~/Descargas/SPONSORS/` (28/09/2026), todos pasados a blanco
 * monocromo y recortados al trazo (`public/assets/home/sponsors/`), como en la
 * referencia de la organización (`~/Descargas/refe.jpeg`): así conviven marcas
 * de colores muy distintos sin que ninguna grite más que su tier.
 *
 * T2 - BITCOIN todavía no tiene logos: un tier vacío no se renderiza, y entra
 * solo con agregar sus sponsors acá.
 */

export type Sponsor = {
  src: string;
  alt: string;
  /**
   * Compensación óptica: cuánto del alto de la caja ocupa el logo. Un wordmark
   * ancho a 100% se ve mucho más grande que un isologo compacto con la misma
   * caja, así que los wordmarks van más bajos.
   */
  scale: number;
};

export type SponsorTier = {
  id: string;
  /** Alto de la caja de cada logo en este tier. */
  logoH: string;
  sponsors: Sponsor[];
};

const s = (slug: string, alt: string, scale = 0.72): Sponsor => ({
  src: `/assets/home/sponsors/${slug}.png`,
  alt,
  scale,
});

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "whale",
    logoH: "clamp(52px, 6.4vw, 84px)",
    // FBI vino suelta, sin carpeta de tier, al mismo nivel que "T1 - WHALE".
    sponsors: [s("exness", "Exness", 0.68), s("fbi", "Fundación Bitcoin Iberoamérica", 1)],
  },
  {
    id: "bitcoin",
    logoH: "clamp(44px, 5.2vw, 68px)",
    sponsors: [],
  },
  {
    id: "full-node",
    logoH: "clamp(40px, 4.6vw, 60px)",
    sponsors: [s("cake-wallet", "Cake Wallet"), s("paystand", "Paystand")],
  },
  {
    id: "node",
    logoH: "clamp(32px, 3.6vw, 48px)",
    sponsors: [
      s("criptala", "Criptala"),
      s("jxlabs", "JXLabs", 0.66),
      s("lemon", "Lemon", 0.74),
      s("nonco", "Nonco", 0.6),
      s("roxom", "Roxom"),
      s("vantage", "Vantage", 0.8),
    ],
  },
  {
    id: "satoshi",
    logoH: "clamp(28px, 3vw, 40px)",
    sponsors: [s("belo", "Belo", 1), s("pala", "Pala Blockchain", 1)],
  },
].filter((tier) => tier.sponsors.length > 0);
