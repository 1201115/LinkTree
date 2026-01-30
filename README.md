# TripTree

Aplicação tipo Linktree para viagens com perfil público, autenticação, painel de administração e mapa interativo com pinpoints iluminados.

## Requisitos
- Node.js 20+
- Docker (opcional para Postgres e deploy)

## Configuração local (rápido)
1) Copie os exemplos de env:
- frontend: crie `.env.local` baseado em `.env.example`
- backend: crie `.env` baseado em `.env.example`

2) Suba Postgres (opcional via Docker):
- `docker compose up -d db`

3) Backend:
- `cd backend`
- `npm install`
- `npx prisma migrate dev --name init`
- `npx prisma db seed`
- `npm run dev`

4) Frontend:
- `cd frontend`
- `npm install`
- `npm run dev`

A app ficará em http://localhost:3000
API em http://localhost:4000

## Deploy com Docker / Dokploy
- `docker compose up -d --build`

### Produção (cookies/sessões)
- Definir `JWT_SECRET` forte
- Definir `CORS_ORIGIN` com o domínio do frontend
- Definir `COOKIE_SECURE=true` quando usar HTTPS

## Conta demo
- Email: demo@triptree.dev
- Password: TripTree123!

## Funcionalidades
- Login / criação de conta
- Dashboard da própria conta
- Página pública com links e ícones
- Mapa do mundo com pinpoints das viagens
- Design moderno e mobile-first
- Autocomplete de destinos (Nominatim/OpenStreetMap)
