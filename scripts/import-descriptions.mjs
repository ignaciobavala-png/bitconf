// Lee el texto de la "Vista expandida" de la app de la org (copiado a un .txt)
// y genera lib/agenda/descriptions.generated.ts.
//   node scripts/import-descriptions.mjs ~/Descargas/vista-expandida.txt
//
// Cada charla viene como `#<n><título> ⧉<tab><descripción><tab>` y a
// continuación los speakers (líneas con ✕ o "+ speaker"). Las repetidas (filas "(MAIN)") traen
// el mismo texto. Se descartan los borradores internos de la org.
import fs from "node:fs";

const file = process.argv[2];
if (!file) throw new Error("Falta la ruta del .txt");
const text = fs.readFileSync(file, "utf8").replace(/\r/g, "");

const DRAFT = /\(deducida\)|\(de la postulaci[oó]n\)|✓ validar|SIN DATOS SUFICIENTES/i;
const MAX_ID = 250;
const out = {};
let empty = 0, drafts = 0;

// La descripción es una celda: va después de "⧉" + tab(s) y termina en el tab
// que cierra la celda, justo antes del salto de línea.
const re = /#(\d+)([^\n\t]*?) ⧉[\t ]+([\s\S]*?)\t[ ]*\n/g;
for (const m of text.matchAll(re)) {
  // Un título que empieza con número ("#29" + "8, 18, 80…") se pega al id:
  // los ids de la app llegan hasta ~220, así que se recorta lo que sobra.
  let digits = m[1];
  while (digits.length > 1 && Number(digits) > MAX_ID) digits = digits.slice(0, -1);
  const id = `t${digits}`;
  let d = m[3].replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!d || /^\+ descripci[oó]n$/.test(d)) { empty++; continue; }
  d = d.replace(/\s*\+ speaker\s*$/, "").trim();
  if (DRAFT.test(d)) { drafts++; continue; }
  if (d.length > 4000) continue;
  out[id] = out[id] ?? d;
}

const body = `// Generado por scripts/import-descriptions.mjs: no editar a mano.
// Descripciones de la "Vista expandida" de la app de la org, por id de sesión
// del temario (t70). Parche hasta que el temario publicado traiga \`description\`;
// si la sesión ya la trae, esa manda sobre esta.
export const DESCRIPTIONS: Record<string, string> = ${JSON.stringify(out, null, 2)};
`;
fs.writeFileSync("lib/agenda/descriptions.generated.ts", body);
console.log({ importadas: Object.keys(out).length, vacias: empty, borradores_omitidos: drafts });
