/**
 * Qué partes de fase 2 están publicadas.
 *
 * Feedback de la organización (10/09/2026): "No mostramos aún: AGENDA,
 * SPEAKERS, MI AGENDA". Lo que se oculta son los accesos desde la navegación,
 * no las páginas.
 *
 * En `main` las páginas todavía no existen (llegan con la rama `fase-2`), así
 * que estos flags son por ahora el interruptor de las burbujas de `#accesos`.
 * El día que la organización confirme el programa se pasan a `true` y los
 * accesos vuelven solos, sin tocar el markup.
 */
export const SHOW_SPEAKERS = false;
export const SHOW_AGENDA = false;
export const SHOW_MI_AGENDA = false;
