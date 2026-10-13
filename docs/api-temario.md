# API del temario — `POST /api/org/temario`

Cómo el artefacto de la organización publica el temario en la web.

## Flujo

```
Artefacto (Grilla) ──► su Claude arma el JSON ──► POST /api/org/temario ──► tabla temario_snapshots ──► /agenda y /mi-agenda
```

- La web lee siempre el **último envío válido**. Mientras no haya ninguno, cae al temario cargado a mano en `lib/agenda/temario.ts`.
- Cada envío es un **snapshot completo** que reemplaza al anterior. Mandar lo mismo dos veces no cambia nada.
- Si no valida, responde 4xx con los motivos y **no se toca lo publicado**.
- Se guardan los últimos 20 envíos (volver atrás = reenviar uno viejo).

## Dos formas de que llegue (se activa la que corresponda)

La web toma el temario, por orden de preferencia, de:

1. **Lectura** — `TEMARIO_SOURCE_URL` (+ `TEMARIO_SOURCE_KEY` si el origen pide clave, como Bearer): la web busca el `temario.json` que la organización publica (por ejemplo en GitHub Pages) cada 5 minutos. Una respuesta que no valida **se ignora** y se sigue con lo anterior.
2. **Envío** — `POST /api/org/temario` (abajo).
3. El temario cargado a mano en `lib/agenda/temario.ts`.

Las tres usan el mismo formato y la misma validación.

## Autenticación (solo para el envío)

`Authorization: Bearer <ORG_API_KEY>`. La clave vive en las variables de entorno del servidor, nunca en el artefacto ni en el repo. Sin `ORG_API_KEY` configurada el endpoint responde **503** (apagado), nunca queda abierto.

## Respuestas

| Código | Significa |
|---|---|
| 200 | Publicado. Devuelve `published` (cantidad), `sessionsByDay` y `warnings`. |
| 400 | El cuerpo no es JSON. |
| 401 | Falta la clave o es incorrecta. |
| 409 | Llegaron menos de la mitad de las sesiones que ya hay publicadas: parece un envío incompleto. Si es a propósito, reenviar con `?force=1`. |
| 413 | Más de 1 MB. |
| 422 | No valida. `errors` lista cada problema (máx. 25). |
| 503 | Endpoint sin habilitar (falta `ORG_API_KEY`). |

`GET /api/org/temario` (misma clave) devuelve qué hay publicado: fecha, cantidad de sesiones y desglose por día.

## Formato `labitconf.temario.v1`

```json
{
  "schema": "labitconf.temario.v1",
  "generatedAt": "2026-10-13T19:00:00Z",
  "stages": [{ "key": "s1", "name": "Pastilla" }],
  "sessions": [{
    "id": "id-estable-de-la-tarjeta",
    "day": "2026-10-30",
    "start": "11:00",
    "durationMin": 60,
    "stages": ["s1", "s2"],
    "kind": "charla",
    "language": "es",
    "title": "Texto literal",
    "speakers": [{ "key": "clave", "name": "Texto literal" }],
    "moderator": null,
    "tags": ["bitcoin"]
  }]
}
```

Reglas que valida el servidor:

- `stages[].key` es `s1`…`s9`; la web hoy tiene seis columnas: `s1` Pastilla, `s2` Visión, `s3` ABC, `s4` WorkShop, `s5` Business, `s6` Autocustodia. **El nombre que se muestra es el de la web** (`STAGE_NAMES` en `lib/speakers/schedule.ts`); si el artefacto manda otro, el envío entra igual y la web sigue con el suyo.
- `day` solo `2026-10-30` o `2026-10-31`. `start` en `HH:MM` hora de Buenos Aires, múltiplo de 5. `durationMin` entero 5–600, múltiplo de 5.
- `stages` de una sesión: uno o más escenarios **consecutivos** (una plenaria que cruza columnas).
- `id` único en el envío, texto estable. **Es la clave de Mi Agenda**: si cambia al mover una charla, el asistente la pierde de su lista.
- Dos sesiones no pueden pisarse en el mismo escenario y horario.
- `kind`: `charla | panel | firetalk | plenaria | taller | otro` (otro valor se guarda como `otro` con aviso).
- `tags` opcional, de los 12 clusters de `lib/speakers/tags.ts`. Si una sesión no trae, conserva los provisorios del temario cargado a mano cuando el título coincide.
- **Lo que se guarda se reconstruye desde los campos validados**, no es el body recibido: un campo de más (un mail, una nota interna) se descarta y nunca llega a la base ni a una página pública.

## Puesta en marcha

**Si la organización publica un archivo (lectura):** cargar `TEMARIO_SOURCE_URL` en Vercel (Preview y Production), sin comillas. No requiere tabla ni clave nuestra.

**Si la organización envía (POST):**
1. Correr `lib/db/temario.sql` en Supabase (tabla nueva, no toca nada existente).
2. Cargar `ORG_API_KEY` en Vercel (Preview y Production), sin comillas.
3. Pasarle la clave a la organización **por privado**.
4. Probar: `GET` con la clave → `{"published": false}`; luego un `POST`.

## Piezas

- `lib/agenda/snapshot.ts` — validación, normalización y traducción a `Session` (puro, sin red).
- `lib/agenda/source.ts` — lectura del último envío (`getSessions()` con fallback).
- `app/api/org/temario/route.ts` — recepción.
- `lib/db/temario.sql` — tabla y RLS.
