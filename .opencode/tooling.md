# Tooling and Workflow

## Tooling

- Package manager: Bun (`bun install`, `bun run ...`).
- Formatting/linting: Biome (`bun run check`).
- Types: `bun run check-types`.
- Database: Drizzle (`bun run db:push`, `bun run db:studio`).

## Workflow Expectations

- Keep modules small and focused; prefer composable utilities.
- Update README or relevant docs when behavior changes.
- Do not commit secrets; use `.env` and `.dev.vars`.
