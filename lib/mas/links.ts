// Destinos de los CTA de la sección MÁS.
//
// `null` = la organización todavía no mandó el formulario. El botón se
// renderiza igual pero apagado (ver CtaButton en components/mas/ui.tsx), así
// el bloque queda armado y a la vista qué falta, en vez de un link muerto a "#".
export const MAS_FORMS = {
  // "QUIERO SUMARME" — The University Hub
  hub: null,
  // "POSTULAR UNIVERSIDAD" — grid de universidades asociadas
  postularUniversidad: null,
  // "POSTULAR MI PROYECTO" — Student Demo Day
  demoDay: null,
  // Ya en uso desde la vieja /comunidad
  embajadores: "https://forms.gle/x7KFRbUTVSahpgqCA",
  comunidades: "https://forms.gle/wUCHHJEgr8ZeWGK49",
  // "QUIERO SER VOLUNTARIO"
  voluntarios: null,
} as const satisfies Record<string, string | null>;
