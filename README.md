# X Media Likes Dashboard

Application Next.js 15 permettant d'authentifier un utilisateur X (Twitter) via OAuth 2.0, de synchroniser ses tweets likés contenant des médias, de les explorer avec filtres/tri et de visualiser des statistiques détaillées.

## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Stack & Architecture](#stack--architecture)
- [Prérequis](#prérequis)
- [Configuration](#configuration)
- [Installation & Démarrage](#installation--démarrage)
- [Base de données & Migrations](#base-de-données--migrations)
- [Synchronisation des likes](#synchronisation-des-likes)
- [Tests & Qualité](#tests--qualité)
- [Déploiement Vercel + Neon](#déploiement-vercel--neon)
- [API interne](#api-interne)
- [Jeux de données factices](#jeux-de-données-factices)
- [Roadmap / Limitations](#roadmap--limitations)

## Fonctionnalités
- Authentification via NextAuth (OAuth 2.0 X v2, scopes `tweet.read users.read like.read offline.access`).
- Synchronisation incrémentale des tweets likés avec médias (`GET /2/users/:id/liked_tweets`).
- Stockage PostgreSQL via Prisma (Tweet/Media/Author + état de synchronisation).
- Dashboard avec filtres (type de média, auteur, recherche, date) & tri (likes, retweets, date).
- Pagination côté serveur + cache en mémoire côté API.
- Page Statistiques avec graphiques Recharts (top auteurs, top hashtags, timeline cumulée, distribution médias).
- API REST interne documentée (OpenAPI).
- Jobs de sync idempotents (verrou en mémoire) avec backoff en cas de rate-limit.
- Observabilité minimale (logs Pino), sécurité (cookies `Secure`, headers CSP, chiffrement des tokens).
- Tests unitaires (Vitest) + e2e (Playwright) + lint/format + CI GitHub Actions.

## Stack & Architecture
- **Front** : Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn-like composants maison, TanStack Query côté client.
- **Back** : Next.js API routes, Prisma, PostgreSQL, Pino, NextAuth, Zod pour la validation.
- **Infra** : GitHub Actions, Husky + lint-staged, scripts Prisma.
- **Organisation** :
  - `src/domain` (entités & mappers)
  - `src/application` (services, cas d'usage)
  - `src/infrastructure` (clients Twitter, cache)
  - `src/server` (Prisma, logger, verrous)
  - `app` (pages & routes API App Router)

## Prérequis
- Node.js 20+
- pnpm (`corepack enable` recommandé)
- Accès API X (Twitter) avec application OAuth 2.0 (User context)
- Base PostgreSQL (Neon, Supabase, RDS…)

### Création de l'application X
1. Créer une app dans le [Developer Portal](https://developer.twitter.com/en/portal/projects-and-apps).
2. Activer OAuth 2.0 (User context) avec les scopes : `tweet.read`, `users.read`, `like.read`, `offline.access`.
3. Définir l'URL de callback `https://your-domain/api/auth/callback/x` (ou `http://localhost:3000/...` en local).
4. Récupérer `Client ID`, `Client Secret`, `Redirect URI`.

## Configuration
Copier `.env.example` en `.env` puis renseigner les variables :

```bash
cp .env.example .env
```

Points clés:
- `DATABASE_URL` : URL PostgreSQL.
- `NEXTAUTH_SECRET` : chaîne générée (ex. `openssl rand -base64 32`).
- `TOKEN_ENCRYPTION_KEY` : 32 caractères pour chiffrer les tokens OAuth.
- `DISABLE_AUTH_GUARD=true` + `DEV_USER_ID=<id>` pour un mode développement/offline (pas d'auth X).
- `CRON_SECRET` & `CRON_ACCESS_TOKEN` : pour déclencher la sync depuis un cron sécurisé.

## Installation & Démarrage
```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```
L'application tourne ensuite sur [http://localhost:3000](http://localhost:3000).

## Base de données & Migrations
- Schéma Prisma dans `prisma/schema.prisma`.
- Migration initiale : `prisma/migrations/20240601000000_init`.
- Script de seed (`pnpm seed`) utilisant `data/mock-likes.json` pour avoir un dataset de développement.
- Reset complet :
```bash
pnpm db:reset
pnpm seed
```


Pour le mode offline, le seed crée un utilisateur NextAuth `dev-user` (email `dev@example.com`). Définissez `DISABLE_AUTH_GUARD=true` et `DEV_USER_ID=dev-user` pour naviguer sans OAuth X.

## Synchronisation des likes
- Route API: `POST /api/sync` (protégée) avec verrou pour éviter les exécutions concurrentes.
- Utilise `since_id` & `pagination_token` pour ne synchroniser que les nouveautés.
- Gestion du rate limit (status 429) avec backoff exponentiel et cache mémoire 60s.
- Cron : envoyer `POST /api/sync?userId=<ID>` avec header `x-cron-secret: $CRON_SECRET` et un token `CRON_ACCESS_TOKEN` disposant des droits nécessaires.

## Tests & Qualité
```bash
pnpm lint        # ESLint Next + TS strict
pnpm test        # Tests unitaires Vitest
pnpm test:e2e    # Tests E2E Playwright
pnpm format      # Prettier
```
- Husky installe un hook pre-commit (lint-staged).
- CI GitHub Actions (`.github/workflows/ci.yml`) : lint, tests, build.

## Déploiement Vercel + Neon
1. Créer une base Neon, récupérer `DATABASE_URL` + `DIRECT_URL`.
2. Pousser le repo sur GitHub.
3. Sur Vercel : `New Project` → importer le repo.
4. Renseigner les variables d'environnement (identiques à `.env`), y compris `NEXTAUTH_URL=https://<project>.vercel.app`.
5. Ajouter un [Vercel Cron](https://vercel.com/docs/cron-jobs) `0 * * * *` → `POST https://<project>.vercel.app/api/sync?userId=<id>` avec header `x-cron-secret`.
6. Déployer. Prisma se mettra à jour via `pnpm db:migrate` (cf. workflow). Utiliser `pnpm seed` en local si besoin.

### Docker Compose (optionnel)
Un fichier `docker-compose.yml` peut être ajouté pour lancer Postgres + l'app Next. Adapter les scripts selon vos besoins.

## API interne
- Documentation OpenAPI dans `docs/openapi.yaml`.
- Exemples `curl` :
```bash
# Lancer une sync (session ou cron)
curl -X POST http://localhost:3000/api/sync \
  -H "Cookie: next-auth.session-token=..."

# Lister les likes paginés
curl "http://localhost:3000/api/likes?type=image&sort=likes_desc&page=1&pageSize=12" \
  -H "Cookie: next-auth.session-token=..."

# Détails d'un tweet
curl http://localhost:3000/api/likes/1 \
  -H "Cookie: next-auth.session-token=..."
```

## Jeux de données factices
`data/mock-likes.json` contient auteurs/tweets/médias pour travailler hors ligne. Le seed insère ces données en base.

## Roadmap / Limitations
- Rafraîchissement automatique du token OAuth (implémentation TODO dans `auth.ts`).
- Gestion fine du quota X (persistance des headers rate-limit).
- Scheduler managé (Supabase edge functions, etc.).
- Upload d'instantanés JSON pour mode offline complet.

Bon build 🚀
