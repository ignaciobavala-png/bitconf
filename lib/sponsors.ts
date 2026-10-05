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
  /**
   * Tope de ancho en múltiplos del alto de la caja (default 4.5). Solo se
   * sube para wordmarks muy apaisados: Oracle Numeris es 10.7:1 y con el tope
   * general quedaba a menos de la mitad del alto que los demás.
   */
  maxAspect?: number;
};

export type SponsorTier = {
  id: string;
  /** Alto de la caja de cada logo en este tier. */
  logoH: string;
  /**
   * Toda la fila en una sola línea desde `lg`: el alto de los logos sale del
   * ancho disponible y no al revés (pedido de la organización, 29/09).
   */
  oneLine?: boolean;
  sponsors: Sponsor[];
};

const s = (slug: string, alt: string, scale = 0.72, maxAspect?: number): Sponsor => ({
  src: `/assets/home/sponsors/${slug}.png`,
  alt,
  scale,
  maxAspect,
});

export const SPONSOR_TIERS: SponsorTier[] = ([
  {
    id: "whale",
    logoH: "clamp(56px, 7vw, 96px)",
    // FBI salió de la primera fila a pedido de la organización (29/09): Exness
    // queda solo como Whale. El PNG sigue en /sponsors por si vuelve a otro tier.
    sponsors: [s("exness", "Exness", 0.68)],
  },
  {
    id: "bitcoin",
    logoH: "clamp(44px, 5.2vw, 68px)",
    sponsors: [],
  },
  {
    id: "full-node",
    // Más grande que la fila de Node, que va apretada en una línea.
    logoH: "clamp(46px, 5.4vw, 72px)",
    sponsors: [s("cake-wallet", "Cake Wallet"), s("paystand", "Paystand")],
  },
  {
    id: "node",
    // Los siete en una línea: la suma de anchos de los logos a su `scale` da
    // ~23.1 veces el alto de la caja (20.5 de los seis originales + 2.6 de
    // Coinbox, sumado el 05/10), y quedan seis huecos de 3vw. 80px es el
    // padding lateral de la sección. Con el piso de 28px entra desde ~890px de
    // ancho, así que el `nowrap` desde lg (1024) no desborda. Si se suma otro
    // logo, recalcular el divisor.
    logoH: "clamp(28px, calc((100vw - 80px - 18vw) / 23.1), 48px)",
    oneLine: true,
    sponsors: [
      s("criptala", "Criptala"),
      s("jxlabs", "JXLabs", 0.66),
      s("lemon", "Lemon", 0.74),
      s("nonco", "Nonco", 0.6),
      s("roxom", "Roxom"),
      s("vantage", "Vantage", 0.8),
      // Isologo + wordmark apilado con "MINING" abajo: compacto, va más alto.
      s("coinbox", "Coin Box Mining", 0.9),
    ],
  },
  {
    id: "satoshi",
    // La fila más chica: por debajo del alto visible de los logos de Node.
    logoH: "clamp(18px, 2.2vw, 30px)",
    // Metamind, Money On Chain y Oracle Numeris sumados el 05/10/2026
    // (referencia de la organización: ~/Descargas/REFE.jpeg).
    sponsors: [
      s("belo", "Belo", 0.9),
      s("pala", "Pala Blockchain", 0.9),
      s("metamind", "Metamind", 0.66),
      s("money-on-chain", "Money On Chain", 0.9),
      s("oracle-numeris", "Oracle Numeris", 0.6, 7),
    ],
  },
] satisfies SponsorTier[]).filter((tier) => tier.sponsors.length > 0);
