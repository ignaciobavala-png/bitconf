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
 *
 * 16/10/2026: todos los tiers ~35% más chicos a pedido de la organización
 * (guiarse por Media Partners; que entren todos en una pantalla).
 *
 * 19/10/2026: todas las filas centradas, como Media Partners (pedido de la
 * organización); los tamaños siguen el orden de tier, de mayor a menor.
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
  /**
   * Multiplica el alto de la caja de este logo sobre el del tier. Solo para
   * isologos casi cuadrados con texto adentro (VnishCom): con `scale` no
   * alcanza, porque el logo nunca pasa del alto de su caja.
   */
  boxScale?: number;
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
    // Más chico que antes (era clamp(56px, 7vw, 96px)) y centrado, a pedido de
    // la organización (15/10/2026): con 96px los logos igualaban el alto del
    // título "SPONSORS" y competían con él.
    logoH: "clamp(30px, 3.6vw, 50px)",
    // FBI salió de la primera fila a pedido de la organización (29/09): Exness
    // queda solo como Whale. El PNG sigue en /sponsors por si vuelve a otro tier.
    // NEXO sumado el 12/10/2026 (refe de la organización por WhatsApp):
    // isologo + wordmark 5:1, mismo alto óptico que Exness.
    sponsors: [s("exness", "Exness", 0.68), s("nexo", "NEXO", 0.68)],
  },
  {
    id: "bitcoin",
    logoH: "clamp(44px, 5.2vw, 68px)",
    sponsors: [],
  },
  {
    id: "full-node",
    // Más grande que la fila de Node, que va apretada en una línea.
    logoH: "clamp(30px, 3.6vw, 46px)",
    // Bull Market sumado el 05/10/2026 (refe de la organización:
    // ~/Descargas/refe.jpeg). Wordmark 6.3:1 con isologo: va más bajo que
    // los otros dos para no pasar del tope de ancho y pesar lo mismo.
    sponsors: [
      s("cake-wallet", "Cake Wallet"),
      s("paystand", "Paystand"),
      s("bull-market", "Bull Market", 0.6),
      // Bitcoin.ar sumado el 06/10/2026: wordmark 6.1:1, mismo trato que Bull
      // Market. El naranja del isologo pasa a blanco como el resto.
      s("bitcoin-ar", "Bitcoin.ar", 0.6),
      // IKIGII y Rootstock sumados el 15/10/2026 (posición: captura de la
      // organización por WhatsApp). IKIGII es el lockup con "by Towerbank"
      // (1.7:1, casi cuadrado: con la caja de la fila el texto no se lee, va
      // con caja más alta como VnishCom). Rootstock es 6.1:1, mismo trato que
      // Bull Market.
      { ...s("ikigii", "IKIGII", 1), boxScale: 1.5 },
      s("rootstock", "Rootstock", 0.6),
      // Bull Bitcoin pasó de Node a Full Node el 19/10/2026, al lado de
      // Rootstock (pedido de la organización). Wordmark 4.3:1.
      s("bull-bitcoin", "Bull Bitcoin", 0.62),
    ],
  },
  {
    id: "node",
    // Los ocho en una línea (Bull Bitcoin sumado el 15/10 y movido a Full Node
    // el 19/10: divisor vuelve a 25.4 y siete huecos de 3vw = 21vw). La suma de anchos de los logos a su `scale` da
    // ~25.4 veces el alto de la caja (20.5 de los seis originales + 2.6 de
    // Coinbox, sumado el 05/10, + 2.3 de Money On Chain, subido de Satoshi el
    // 10/10), y quedan siete huecos de 3vw. 80px es el padding lateral de la
    // sección. Con el piso de 28px entra desde ~1000px de ancho, así que el
    // `nowrap` desde lg (1024) no desborda. Si se suma otro logo, recalcular
    // el divisor.
    logoH: "clamp(20px, calc((100vw - 80px - 21vw) / 25.4), 32px)",
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
      // Subido de Satoshi a Node el 10/10/2026, a pedido de la organización.
      s("money-on-chain", "Money On Chain", 0.9),
    ],
  },
  {
    id: "satoshi",
    // La fila más chica: por debajo del alto visible de los logos de Node.
    logoH: "clamp(14px, 1.5vw, 21px)",
    // Metamind y Oracle Numeris sumados el 05/10/2026 (referencia de la
    // organización: ~/Descargas/REFE.jpeg). Money On Chain entró acá también y
    // el 10/10 pasó a Node.
    sponsors: [
      s("belo", "Belo", 0.9),
      s("pala", "Pala Blockchain", 0.9),
      s("metamind", "Metamind", 0.66),
      s("oracle-numeris", "Oracle Numeris", 0.6, 7),
      // BitJem MAX sumado el 06/10/2026: la píldora azul de "MAX" va en blanco
      // con las letras caladas (transparentes), para no perder el texto.
      s("bitjem", "BitJem MAX", 0.8),
      // JusToken y VnishCom sumados el 08/10/2026 (refe: ~/Descargas/ejemplo.jpeg).
      // JusToken es un wordmark 7.6:1: a 0.6 pide ~4.6 cajas de ancho, apenas
      // arriba del tope general. VnishCom es un isologo casi cuadrado con el
      // nombre adentro: con la caja de la fila el texto no se leía, así que
      // su caja es 1.6 veces más alta (≈ el alto de la fila de Node).
      s("justoken", "JusToken", 0.6, 5),
      { ...s("vnish", "VnishCom", 1), boxScale: 1.6 },
      // EOLAX y Tienda Cripto sumados el 12/10/2026. Tienda Cripto es el
      // wordmark en dos renglones (2:1): con la caja de la fila cada renglón
      // quedaba ilegible, así que va con caja alta como VnishCom.
      s("eolax", "EOLAX", 0.8),
      { ...s("tienda-cripto", "Tienda Cripto", 1), boxScale: 1.6 },
      // Bitget Wallet sumado el 15/10/2026: la versión blanca del Drive ya trae
      // la flecha calada. Wordmark 6.3:1, mismo trato que Bull Market.
      s("bitget-wallet", "Bitget Wallet", 0.6),
    ],
  },
] satisfies SponsorTier[]).filter((tier) => tier.sponsors.length > 0);
