## Lei Industries (Lei Indias) – Next.js + Postgres App

This is a Next.js 14 application for Lei Industries, using a Postgres database and secure JWT-based authentication for both customers and admins. The backend uses the Next.js App Router with `app/api/*` routes and a shared Postgres connection pool.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, `pg` Postgres client, Zod for validation, JSON Web Tokens
- **State Management**: Zustand
- **Database**: PostgreSQL (tables such as `User`, `Admin`, `Product`, `Category`, `Order`, `OrderItem`, `Inquiry`, etc.)

### Prerequisites
- Node.js 20+
- `pnpm` (project uses `pnpm@9`)
- PostgreSQL 14+ accessible via `DATABASE_URL`

### Installation
```bash
pnpm install
```

### Environment Configuration
Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

**Required variables:**
- `DATABASE_URL` – Connection string to your Postgres instance.
- `JWT_SECRET` – Strong secret key for signing JWTs (required in production).
- `JWT_EXPIRES_IN` – Token lifetime (e.g. `7d`, `1h`).
- `NODE_ENV` – `development`, `staging`, or `production`.

You should maintain **separate `.env` files per environment** (e.g. `.env.development`, `.env.staging`, `.env.production`) and load them in your hosting/CI tooling:
- Development: local Postgres, relaxed SSL.
- Staging: managed Postgres, production-like config.
- Production: managed Postgres, `NODE_ENV=production`, `JWT_SECRET` required, SSL enabled.

### Scripts
```bash
pnpm dev         # Run Next.js dev server
pnpm build       # Build for production
pnpm start       # Start Next.js in production mode (uses built assets)
pnpm start:prod  # Start with NODE_ENV=production
pnpm lint        # Run ESLint
pnpm seed:admin  # Seed initial admin user (requires DATABASE_URL and admin defaults)
```

### Database Schema & Migrations
The app expects a PostgreSQL database with (at least) the following tables:
- `User` – Customer accounts (`id`, `name`, `email`, `password`, `company`, `phone`, `role`, `"isActive"`, timestamps).
- `Admin` – Admin users (`id`, `name`, `email`, `password`, `role`, `"isActive"`, timestamps).
- `Product` – Products with SKUs and metadata.
- `Category` – Product categories and hierarchy.
- `Order` – RFQ / order header (`companyName`, `contactName`, `email`, `phone`, `companyAddress`, `notes`, `status`, timestamps).
- `OrderItem` – Items belonging to an order (`orderId`, `productId`, `sku`, `name`, `quantity`, `notes`).
- `Inquiry` – Contact / inquiry submissions.
- `ContactInfo`, `Resource`, `Blog`, `Career` – Site content models.

> **Note:** Currently the app uses raw SQL via `pg` (see `lib/pg.ts` and `app/api/*`). You can either:
> - Manage the schema with plain SQL migrations (recommended for consistency with existing queries), or
> - Introduce Prisma and align the schema with the existing table/column names.

#### Option A – SQL Migrations (Recommended with Current Code)
This repo includes a baseline schema in `prisma/schema.sql` that matches the table and column names used in `app/api/*` routes.

- Review and adjust `prisma/schema.sql` as needed for your environment.
- Apply it to your database using `psql` or your migration tool of choice.

Example workflow:
```bash
psql "$DATABASE_URL" -f prisma/schema.sql
```

#### Option B – Prisma (If You Want a Typed ORM)
If you prefer Prisma:
1. Install Prisma:
   ```bash
   pnpm add -D prisma
   pnpm add @prisma/client
   ```
2. Create `prisma/schema.prisma` defining models that match the existing SQL:
   - Use `@@map` and `@map` to keep table/column names like `"User"`, `"OrderItem"`, `"createdAt"`.
3. Generate the client and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Gradually refactor API routes to use Prisma instead of raw SQL.

### Running the App
Development:
```bash
pnpm dev
```
The dev server typically runs on `http://localhost:3000`.

Production build:
```bash
pnpm build
pnpm start:prod
```

Ensure your production environment provides:
- `DATABASE_URL` with SSL (Next.js `lib/pg.ts` already sets SSL for production).
- A strong `JWT_SECRET`.

### Docker & Deployment

#### Minimal Dockerfile (Example)
Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY public ./public
COPY next.config.mjs ./next.config.mjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["pnpm", "start"]
```

> **Note:** You should implement a simple `/api/health` route that returns `{ status: 'ok' }` with HTTP 200 for health checks.

#### Example Docker Build & Run
```bash
docker build -t leiindias-app .
docker run --env-file .env -p 3000:3000 leiindias-app
```

### CI/CD Considerations
- Run `pnpm lint` and `pnpm build` in your CI pipeline.
- Run DB migrations before starting the app in each environment.
- Provide environment-specific secrets/variables via your CI/CD platform.

### Security Notes
- Never commit `.env` files or secrets to version control.
- Use strong `JWT_SECRET` values and rotate them periodically.
- Validate and sanitize all input (already started via Zod in API routes).
- Restrict admin APIs using roles (`admin`, `superadmin`) via JWT (see `lib/jwt.ts` and admin routes).

