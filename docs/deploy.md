# Deploy — LABITCONF 26

## Setup

- **Repo**: `ignaciobavala-png/bitconf` (GitHub de Ignacio)
- **Vercel**: cuenta del cliente `weblabitconf26-1256s-projects`, proyecto `labitconf`
- **URL producción**: `https://labitconf-weblabitconf26-1256s-projects.vercel.app`

## CI/CD

Cada push a `main` dispara un deploy automático via GitHub Actions (`.github/workflows/deploy.yml`).

Secrets requeridos en GitHub:
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`

Las variables de entorno de la app están cargadas directamente en el proyecto de Vercel (Production + Preview), no en el repo.

## Deploy manual (emergencia)

```bash
vercel --prod
```

## Caché en desarrollo

Si el favicon o los estilos no se actualizan en `localhost`:

```bash
rm -rf .next
npm run dev
```

El `.next` cache puede quedar desactualizado si se agregan nuevas clases de Tailwind o se modifican archivos de `app/` que Next.js compila al iniciar.
