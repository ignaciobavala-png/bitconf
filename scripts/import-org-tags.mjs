// Importa una sola vez los tags por speaker que la organización escribió a mano
// en el JS de su tablero (LABITCONF-speakers/web.html, `const TAGS_MAP`).
//
// Existe porque al 29/09/2026 los tags no están en la planilla: su página los
// tiene como "fallback hasta que exista col AP". Cuando carguen la columna
// `tags`, el sync la lee directo y este script y su salida se borran.
//
// El mapa de ellos va por `postulacion_num`, que no es único y se renumera. Por
// eso acá se resuelve cada número contra la planilla ACTUAL y se guarda por
// nombre normalizado, que sobrevive a una renumeración. Un número usado por
// dos personas se descarta: no hay forma de saber a cuál le pusieron el tag, y
// es preferible un speaker sin tag a uno con el de otro.
//
// El 29/09 (noche) la organización empezó a cargar su revisión en la columna AP
// de la planilla, pero sin encabezado y solo para algunos speakers (los que
// faltaban y los que corrigieron). Esa revisión gana sobre el TAGS_MAP. Como AP
// no tiene nombre, se la reconoce por contenido: la columna sin encabezado
// después de `web_order` cuyos valores son todos clusters. Si no cumple, no se
// usa — mejor sin revisión que leer otra columna por error.
//
// Uso: node --env-file=.env.local scripts/import-org-tags.mjs

import { writeFileSync } from "node:fs";

const WEB_URL = "https://app-labitconf.github.io/LABITCONF-speakers/web.html";
const OUT = "lib/speakers/org-tags.snapshot.ts";

const { SPEAKERS_SOURCE_URL: SRC, SPEAKERS_SOURCE_KEY: KEY } = process.env;
if (!SRC || !KEY) throw new Error("Faltan SPEAKERS_SOURCE_URL / SPEAKERS_SOURCE_KEY");

// Misma normalización que `normalizeName()` de lib/speakers/source.ts.
const normalizeName = (v) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const html = await (await fetch(WEB_URL)).text();
const literal = html.match(/const TAGS_MAP\s*=\s*(\{[^;]*\});/)?.[1];
if (!literal) throw new Error("No se encontró TAGS_MAP en web.html");
// Es un objeto literal con claves numéricas sin comillas: no es JSON válido.
const tagsMap = JSON.parse(literal.replace(/([{,]\s*)(\d+)\s*:/g, '$1"$2":').replace(/'/g, '"'));

// El Apps Script a veces devuelve una página HTML de Google en vez de JSON.
async function readSheet() {
  const url = `${SRC}?action=get_data&sheet=Speakers&key=${encodeURIComponent(KEY)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const json = await (await fetch(url, { signal: AbortSignal.timeout(45_000) })).json();
      if (Array.isArray(json.data)) return json;
      if (attempt === 3) throw new Error("La hoja Speakers no devolvió filas");
    } catch (err) {
      if (attempt === 3) throw err;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

const sheet = await readSheet();
const [header, ...rows] = sheet.data;
const col = (n) => header.findIndex((h) => String(h ?? "").trim().toLowerCase() === n);
const iNum = col("postulacion_num");
const iNombre = col("nombre");
const iApellido = col("apellido");

const CLUSTERS = new Set(
  ["bitcoin", "custodia", "ia", "legal", "finanzas", "adopcion", "mining", "tecnico",
   "privacidad", "educacion", "institucional", "emprendimiento"]
);
const isClusterList = (v) =>
  v.split(",").map((t) => normalizeName(t)).filter(Boolean).every((t) => CLUSTERS.has(t));

function findRevisionColumn() {
  const named = ["tags", "ap", "tag", "cluster"].map(col).find((i) => i >= 0);
  if (named !== undefined) return named;
  const after = col("web_order");
  if (after < 0) return -1;
  for (let i = after + 1; i < header.length; i++) {
    if (String(header[i] ?? "").trim()) continue;
    const values = rows.map((r) => String(r[i] ?? "").trim()).filter(Boolean);
    if (values.length && values.every(isClusterList)) return i;
  }
  return -1;
}
const iRev = findRevisionColumn();

const byNum = new Map();
const revisionByName = new Map();
for (const r of rows) {
  const first = String(r[iNombre] ?? "").trim();
  if (!first) continue;
  const num = String(r[iNum] ?? "").trim();
  const name = normalizeName([first, String(r[iApellido] ?? "").trim()].filter(Boolean).join(" "));
  byNum.set(num, [...(byNum.get(num) ?? []), name]);
  const rev = iRev >= 0 ? String(r[iRev] ?? "").trim() : "";
  if (rev) revisionByName.set(name, rev);
}

const out = {};
const skipped = [];
for (const [num, tags] of Object.entries(tagsMap)) {
  const names = byNum.get(num) ?? [];
  if (names.length !== 1) {
    skipped.push(`${num} (${names.length ? names.join(" / ") : "no existe"})`);
    continue;
  }
  out[names[0]] = tags;
}
const revised = [];
for (const [name, tags] of revisionByName) {
  if (out[name] !== tags) revised.push(`${name}: ${out[name] ?? "—"} → ${tags}`);
  out[name] = tags;
}

const body = Object.entries(out)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, tags]) => `  ${JSON.stringify(name)}: ${JSON.stringify(tags)},`)
  .join("\n");

writeFileSync(
  OUT,
  `// GENERADO por scripts/import-org-tags.mjs el ${new Date().toISOString().slice(0, 10)}. No editar a mano.
//
// Tags por speaker copiados del TAGS_MAP de LABITCONF-speakers/web.html,
// resueltos por nombre normalizado. Es un puente hasta que la organización
// cargue la columna \`tags\` en la planilla: si esa columna existe, gana ella.
// Descartados por número ambiguo o inexistente: ${skipped.join(", ") || "ninguno"}.
// Revisión de la columna AP aplicada a ${revisionByName.size} speakers.

export const ORG_TAGS_SNAPSHOT: Record<string, string> = {
${body}
};
`
);

console.log(`${Object.keys(out).length} speakers con tag → ${OUT}`);
console.log(iRev >= 0 ? `Revisión AP (col ${iRev}): ${revisionByName.size} filas` : "Sin columna de revisión");
for (const r of revised) console.log(`  ${r}`);
if (skipped.length) console.log(`Descartados: ${skipped.join(", ")}`);
