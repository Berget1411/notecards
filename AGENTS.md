# notecards Monorepo (Infra-First)

Bun + Turborepo monorepo with Next.js (web) and Hono/tRPC (server).

## Quick Reference

- Package manager: Bun (`bun install`, `bun run ...`).
- Lint/format: `bun run check`.
- Typecheck: `bun run check-types`.
- Database: `bun run db:push`, `bun run db:studio`.
- Cloudflare: load the `wrangler` skill before Workers/R2/D1/KV/Queues tasks.

## Detailed Instructions

- [Architecture and refactoring](.opencode/architecture.md)
- [Tooling and workflow](.opencode/tooling.md)
- [Agent skills](.opencode/skills.md)
