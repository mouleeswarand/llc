# LLC Formation Portal

Customers form an LLC or corporation online and then manage it from a dashboard: overview, billing, annual reports, ownership, add-on services, mail and documents.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind · Prisma, with Neon as the backend:

| Neon service | Used for | Code |
| --- | --- | --- |
| Lakebase Postgres | All app data (Prisma; pooled URL at runtime, direct URL for migrations) | `prisma/schema.prisma`, `src/lib/db.ts` |
| Auth (Managed Better Auth) | Sign-up in the formation wizard, login, sessions, route protection | `src/lib/neon-auth.ts`, `src/proxy.ts`, `src/app/api/auth` |
| Object Storage | Private `documents` bucket: uploads + presigned downloads | `src/lib/storage.ts`, `src/app/api/documents` |
| AI Gateway | "Suggest names" in the formation wizard | `src/app/actions/ai.ts` |
| Functions | `compliance` function, run daily by a trigger, marks overdue annual reports LATE | `functions/compliance.ts` |
| Realtime | Mail inbox updates live as mail is logged | `src/lib/realtime*.ts`, `src/app/dashboard/[companyId]/mail` |

All of it is declared in `neon.ts`.

## Setup

```bash
npm install
neon login                      # once, opens a browser
neon deploy                     # provisions everything in neon.ts on the linked branch and
                                # appends the Neon env vars to .env
npx prisma migrate deploy       # create the tables (uses DATABASE_URL_UNPOOLED)
npm run db:seed                 # service catalog
npm run dev                     # http://localhost:3000
```

`.env` also needs `NEON_AUTH_COOKIE_SECRET` (32+ random characters; see `.env.example`).

Sign up through **Start my LLC** to create an account. To give an account demo data, log in once, then run `SEED_USER_EMAIL=you@example.com npm run db:seed`.

Check every service end to end:

```bash
npm run smoke   # Postgres, Auth, Object Storage, Realtime, the compliance Function (and AI Gateway if enabled)
```

## Branch-first development

`.neon` links this folder to the `production` branch. For day-to-day work, use a branch so migrations and test data don't touch production:

```bash
neon checkout dev --create      # new branch with every neon.ts service; pulls its env
npx prisma migrate dev
```

## Deploying the app (e.g. Vercel)

Copy the variables from `.env` into the host's environment, add the production origin to Neon Auth and Realtime:

```bash
neon neon-auth domain add https://app.example.com
```

and add it to `preview.realtime.allowedOrigins` in `neon.ts`, then `neon deploy`. Build command: `npx prisma migrate deploy && npm run build`.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/brand.ts` | Site name, tagline, support email, announcement bar |
| `src/lib/catalog.ts` | States + fees, formation packages, add-on services |
| `src/app/start` | Multi-step formation wizard |
| `src/app/dashboard/[companyId]/*` | Customer dashboard pages |
| `src/app/actions/*` | Server actions (all check company ownership) |

## Not yet wired up

- **Payments.** Orders are created as `PENDING`. Integrate Stripe and mark orders `PAID` from its webhook. Never store card numbers here.
- **Staff back office** for filing IDs, statuses, filed documents and logging received mail. Prisma Studio covers this for now.
- **E-signatures.** "Sign now" only records a timestamp.
- **Auth emails** use Neon's shared sender; production needs custom SMTP (https://neon.com/docs/auth/production-checklist.md).
- **State fees** in `catalog.ts` are approximate.
