/**
 * Qué partes de fase 2 están publicadas.
 *
 * Feedback de la organización (10/09/2026): "No mostramos aún: AGENDA,
 * SPEAKERS, MI AGENDA". Las páginas siguen existiendo y accesibles por URL
 * directa — lo que se oculta son los accesos desde la navegación. Cuando la
 * organización confirme el programa, se pasan a `true` y vuelven solas.
 */
export const SHOW_SPEAKERS = true;
export const SHOW_AGENDA = false;
export const SHOW_MI_AGENDA = false;

/**
 * Charlas en el perfil de cada speaker. La organización (29/09/2026): "Rodo
 * quiere dar prioridad al speaker, no a su charla; eso falta mucho por
 * definir, solo comunicar speaker". Los datos siguen sincronizándose.
 */
export const SHOW_TALKS = false;
