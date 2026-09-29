# Reglas estrictas de diseño — LABITCONF 26

Reglas **obligatorias** para cualquier sección, página o componente nuevo del
sitio, y para revisar lo que ya existe. Salen del feedback del tester y de la
organización; no son sugerencias. Si algo nuevo no puede cumplir una regla, se
consulta antes en vez de hacer una excepción en silencio.

Origen de cada regla entre paréntesis (fecha + dónde apareció el problema).

## Las reglas

1. **Los CTA de un hero con video o foto no van en el centro de la pantalla.**
   Van hacia el borde inferior, en el flujo, justo arriba del titular. Centrados
   tapan la parte linda del fondo y quedan "lanzados en el medio".
   (29/09/2026 — botones "Soy Alumno" / "Soy Universidad" de `/mas/edu-hub`)

2. **Un solo tamaño y peso de título por grilla de cards.** Todas las cards de
   una misma sección usan el estilo de título de las cards grandes: Neue Machina
   900, uppercase, `clamp(18px, 2vw, 24px)`, `line-height: 1.3`. Nada de mezclar
   tamaños entre cards chicas, pills y cards grandes ("ensalada de tamaños").
   (29/09/2026 — "Beneficios y experiencias" de `/mas/edu-hub`)

3. **Las cards de una misma grilla miden lo mismo de alto.** Grilla con
   `auto-rows-fr` (o `items-stretch`) + `h-full` en cada card; manda la más
   alta y las demás se estiran. No combinar cards y pills de alturas distintas
   en el mismo bloque.
   (29/09/2026 — las 4 cards de arriba de "Beneficios y experiencias")

4. **"Más info" se escribe `+ info`, en todo el sitio y en ambos idiomas.**
   Nunca "Más info" ni "More info".
   (29/09/2026 — cards de Hackathon/Bootcamp y `/mas/hackathon`)

5. **Un botón nunca parte su texto en dos renglones.** Todos los botones y pills
   llevan `white-space: nowrap`, así los botones vecinos quedan siempre de la
   misma altura.
   (29/09/2026 — "Participá" al lado de un "Más info" partido en dos)

6. **Título + botón en una card: en la misma línea mientras entren.** Contenedor
   `flex flex-wrap items-center justify-between`: en desktop el botón queda a la
   derecha del título; en mobile o ventanas angostas baja solo abajo del título.
   (29/09/2026 — card "Bootcamp — Workshops y charlas")

7. **Ningún título deja una o dos palabras solas en el último renglón.** Si un
   título o frase de cierre corta puede partir en dos, lleva
   `text-wrap: balance` (o se ajusta el ancho/tamaño para que entre en uno).
   (Pedido recurrente de la organización; reaplicado el 29/09/2026 en "Espacio
   físico exclusivo / en el evento")

8. **El negro del sitio es `#000` (negro puro), en todas las páginas.** Fondo
   de página, secciones, degradés de transición, navbar, footer, modales y
   dropdowns. No usar `#171616` (Alamo del Ser) ni `#0D0D0B` como fondo.
   Excepciones: los degradés decorativos de los placeholders de speakers y el
   trazo de la cara de Qubit.
   (29/09/2026 — pedido de la organización, tomando `/mas/embajadores` como
   referencia)

9. **Los fondos de imagen y video no se ven apagados.** Toda opacidad de un
   fondo pasa por `bgOpacity()` de `lib/ui/bg.ts` (lo hacen solos
   `ParallaxBg` y `MasSection`), que la multiplica por `BG_BOOST` (1.35). Para
   aclarar u oscurecer todos los fondos a la vez se toca solo ese factor, nunca
   sección por sección. Un fondo nuevo con opacidad escrita a mano rompe esta
   regla.
   (29/09/2026 — con el fondo en `#000` el sitio quedaba demasiado oscuro)

## Dónde está implementado

- Estilo de título de card: `CARD_TITLE_STYLE` en `app/mas/edu-hub/page.tsx`.
- Botones: `PillLink` (`app/mas/edu-hub/page.tsx`) y `CtaButton`
  (`components/mas/ui.tsx`), ambos con `nowrap`.
- Brillo de fondos: `BG_BOOST` / `bgOpacity()` en `lib/ui/bg.ts`.

## Cómo sumar una regla

Cuando un feedback de diseño se convierte en regla: agregarla al final de la
lista con su número, qué hacer (no solo qué estaba mal) y el origen entre
paréntesis. No renumerar las existentes: el equipo las cita por número.
