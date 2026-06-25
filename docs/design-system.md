# Design System — LABITCONF 26

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| Fondo | `#0D0D0B` | Background principal |
| Verde brillante | `#9ACE6A` | CTA principal, frases de usuarios, success |
| Verde oscuro | `#4A6E2D` | Frases estáticas/editoriales, bordes de pills |
| Blanco | `#FCFCFC` | Texto principal, inputs |
| Gris | `#A5A8B1` | Texto secundario, pills CTAs |
| Naranja error | `#E3551C` | Estados de error y rate limit |

## Tipografía

**PP Neue Machina** — fuente local en `public/assets/tipografias/neue-machina/`

Variable CSS: `--font-neue-machina`

| Peso | Archivo | Uso |
|---|---|---|
| 900 (Ultrabold) | PlainUltrabold.ttf | Labels, botones, pills |
| 300 (Light) | PlainLight.ttf | Inputs, textos secundarios |

## Componentes UI

### Pills (CTAs y toggle de idioma)

```css
font: Neue Machina 900, uppercase, clamp(10px, 0.8vw, 12px)
letter-spacing: 0.06em
padding: 8px 17px
border: 2px solid #4A6E2D  →  hover: #9ACE6A
background: rgba(13,13,11,0.72) + backdrop-blur(6px)
border-radius: 9999px
```

El fondo semitransparente con blur es necesario para legibilidad sobre el WatermarkLayer.

### Input de razones

```css
border: 2px solid #FCFCFC  (error: #E3551C)
border-radius: 9999px
padding: 9px 20px
box-shadow: 0 0 20px rgba(154,206,106,0.18)
font: Neue Machina 300, clamp(12px, 1.0vw, 14px)
```

### Botón HODL

```css
background: #9ACE6A
color: #0D0D0B
font: Neue Machina 900, uppercase
padding: 6px 18px
border-radius: 9999px
```

## WatermarkLayer

- 10 carriles (`STATIC_LANES`) con `y`, `duration`, `fontSize` por carril
- Frases de usuarios: `#9ACE6A` (verde brillante)
- Frases editoriales (`is_static=true`): `#4A6E2D` (verde oscuro)
- Animación fade-in solo para frases nuevas de usuarios
- Datos en Realtime via Supabase (solo `status = approved`)

## Internacionalización (ES/EN)

Toggle pill en top-left. Idioma activo en `#FCFCFC`, inactivo en `#4A6E2D`.

Textos traducidos: label, placeholder (con typewriter), todos los status messages, CTAs.
**No se traducen**: frases del watermark (contenido de usuarios) ni el botón "HODL →".
