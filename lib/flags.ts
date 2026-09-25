/**
 * Qué partes de fase 2 están publicadas.
 *
 * Feedback de la organización (10/09/2026): "No mostramos aún: AGENDA,
 * SPEAKERS, MI AGENDA". Lo que se oculta son los accesos desde la navegación,
 * no las páginas.
 *
 * Speakers se había habilitado el 25/09/2026 (decisión de Ignacio, al subir
 * la rama `MAS`), pero se vuelve a ocultar ese mismo día: la sección no se
 * va a mostrar en esta primera entrega hasta mejorar el diseño. Vuelve a
 * `true` cuando Ignacio lo confirme. Agenda queda apagada porque esa página
 * ni siquiera está en esta rama todavía (solo se trajo Speakers desde
 * `fase-2`, ver AGENTS.md) — activarla rompería el link con un 404. Se
 * prende cuando la agenda esté lista y se traiga.
 *
 * Este archivo es por ahora el interruptor de las burbujas de `#accesos`. El
 * día que la organización confirme el resto del programa, `SHOW_AGENDA` pasa
 * a `true` y el acceso vuelve solo, sin tocar el markup.
 */
export const SHOW_SPEAKERS = false;
export const SHOW_AGENDA = false;
export const SHOW_MI_AGENDA = false;
