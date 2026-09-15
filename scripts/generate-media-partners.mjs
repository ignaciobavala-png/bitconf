/**
 * Regenera el listado de media partners leyendo la carpeta de logos.
 *
 * Pedido de la organización (10/09): "hay algunos nuevos en la carpeta, van a
 * ir subiendo, estaría guay automatizar que se vaya actualizando". Con esto
 * alcanza con dejar el PNG en public/assets/home/media-partners/ — el nombre
 * del archivo se convierte en el alt y el logo entra solo en el próximo build.
 *
 * Corre en `predev` y `prebuild`, así que no hay paso manual que olvidarse.
 */
import { readdirSync, writeFileSync } from "node:fs";


const DIR = "public/assets/home/media-partners";
const OUT = "lib/media-partners.generated.ts";
const EXT = /\.(png|svg|webp|jpg|jpeg)$/i;

// Nombres que no salen bien de "kebab-case → Title Case".
const ALT_OVERRIDES = {
  ccs: "CCS",
  cripto247: "Cripto247",
  "diario-bitcoin": "DiarioBitcoin",
  iproup: "iProUP",
  sla: "SLA",
  thenewscrypto: "TheNewsCrypto",
  "noticias-fintech-latam": "Noticias Fintech Latam",
};

const titleCase = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const files = readdirSync(DIR).filter((f) => EXT.test(f)).sort();

const entries = files.map((file) => {
  const slug = file.replace(EXT, "");
  const alt = ALT_OVERRIDES[slug] ?? titleCase(slug);
  return `  { slug: ${JSON.stringify(slug)}, src: ${JSON.stringify(`/assets/home/media-partners/${file}`)}, alt: ${JSON.stringify(alt)} },`;
});

const body = `// GENERADO POR scripts/generate-media-partners.mjs — no editar a mano.
// Se regenera en cada \`pnpm dev\` y \`pnpm build\` leyendo ${DIR}.
// Para agregar un partner: dejá el archivo en esa carpeta.

export type MediaPartnerFile = { slug: string; src: string; alt: string };

export const MEDIA_PARTNER_FILES: MediaPartnerFile[] = [
${entries.join("\n")}
];
`;

writeFileSync(OUT, body);
console.log(`[media-partners] ${files.length} logos → ${OUT}`);
