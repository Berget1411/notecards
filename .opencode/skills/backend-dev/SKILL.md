---
name: backend-dev
description: Build and maintain Hono and tRPC backend features with shared logic in packages/api.
compatibility: opencode
metadata:
  stack: hono-trpc
  data: drizzle
---

## What I do

- Add API routes and procedures in `apps/server/` and `packages/api/`
- Keep business logic in `packages/api/` with explicit types at boundaries
- Use Drizzle schemas and queries in `packages/db/`
- Validate inputs and return typed errors

## tRPC patterns (repo-accurate)

- The tRPC router lives in `packages/api/src/routers/` and is composed in `packages/api/src/routers/index.ts`
- Procedures are built from `publicProcedure` or `protectedProcedure` in `packages/api/src/index.ts`
- Context is created in `packages/api/src/context.ts` and passed from `apps/server/src/index.ts`
- The Hono server mounts tRPC at `/trpc/*` using `@hono/trpc-server`
- Authenticated procedures throw `TRPCError` when `ctx.session` is missing

## Adding a new tRPC feature

- Add a router or procedure in `packages/api/src/routers/`
- Export the new router from `packages/api/src/routers/index.ts`
- Use `publicProcedure` or `protectedProcedure` with explicit input/output types
- Access data via `packages/db/` and keep business logic in `packages/api/`
- Ensure `createContext` provides what the procedure needs (session, headers, etc.)

## When to use me

Use this skill for API work, server-side logic, database changes, or authentication flows.
