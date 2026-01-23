# notecards Monorepo (Infra-First)

This is a Bun + Turborepo monorepo with Next.js (web) and Hono/tRPC (server). Use these rules for development.

## Project Structure

- `apps/web/` - Next.js app (TailwindCSS + shadcn/ui)
- `apps/server/` - Hono + tRPC API
- `packages/api/` - API layer and business logic
- `packages/auth/` - Authentication configuration and logic
- `packages/db/` - Drizzle schema and queries

## Infra Monorepo Conventions

- If adding infrastructure, create a root `infra/` directory and keep it split by service (for example `infra/db.ts`, `infra/api.ts`, `infra/web.ts`).
- Keep infra code minimal and typed; avoid mixing infra with app runtime code.

## Code Standards

- TypeScript only; prefer explicit types at public boundaries.
- Keep shared logic in `packages/` and import via workspace names.
- Server code lives in `apps/server/` with tRPC routers in `packages/api/`.
- Web UI uses Tailwind + shadcn/ui; avoid custom CSS unless needed.

## Refactoring Guidelines (Maintainability + Scalability)

### Frontend (Next.js + React)

- Keep UI components presentational; push state, data fetching, and side effects into hooks or route handlers.
- Co-locate feature components under `apps/web/` by domain; share cross-feature UI in `packages/` only when reused.
- Prefer server components for data fetching; isolate client components for interactivity and keep props serializable.
- Extract reusable logic into typed hooks and utilities; avoid duplicating data transformations across components.
- Keep routing concerns in page/layout files; avoid coupling global state to pages when feature-scoped context works.
- Use Tailwind + shadcn/ui as the default; introduce custom CSS only when Tailwind cannot express the design cleanly.

### Backend (Hono + tRPC)

- Keep routers thin: route handlers orchestrate; business logic lives in `packages/api/` services or helpers.
- Use explicit input/output types at router boundaries; validate at the edge and normalize in shared logic.
- Split routers by domain and avoid cross-importing; shared behavior should live in `packages/api/`.
- Keep DB access in `packages/db/` with typed helpers; avoid raw queries inside routers.
- Centralize error handling and logging in Hono middleware; keep errors typed and map to stable error codes.
- Prefer composable procedures and middlewares over large monolithic routers.

### AI Features

- Treat AI calls as infrastructure: isolate providers/adapters, keep prompts and schemas in `packages/`.
- Use structured outputs with schemas; never pass raw model output directly to the UI or database.
- Centralize eval hooks and tracing; keep model selection and retry logic in one place.
- Guard inputs/outputs for safety and PII; sanitize and redact before logging or storage.
- Make AI features deterministic where possible: version prompts, record configs, and keep fallbacks.

## Tooling and Commands

- Package manager: Bun (use `bun install`, `bun run ...`).
- Formatting/linting: Biome (`bun run check`).
- Types: `bun run check-types`.
- Database: Drizzle (`bun run db:push`, `bun run db:studio`).

## Workflow Expectations

- Keep modules small and focused; prefer composable utilities.
- Update README or relevant docs when behavior changes.
- Do not commit secrets; use `.env` and `.dev.vars`.
