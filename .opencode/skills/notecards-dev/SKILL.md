---
name: notecards-dev
description: Guidance for building and refactoring features in the notecards monorepo (Bun + Turborepo, Next.js web app, Hono/tRPC server). Use when planning or implementing work in this repo, choosing where code should live, selecting commands, or aligning with architecture and workflow rules.
---

# Notecards Dev

## Overview

Use this skill to orient work in the notecards monorepo, ensure you pick the right package or app, and follow repo-specific architecture and workflow conventions.

## Quick Start

1. Identify the surface area: `apps/web` for UI, `apps/server` for APIs, `packages/*` for shared logic.
2. Load the most specific skill for the task (`frontend-dev`, `backend-dev`, or `ai-dev`).
3. Follow architecture and refactoring rules from `.opencode/architecture.md`.
4. Use repo commands from `.opencode/tooling.md` for linting, types, and DB work.

## Guidelines

- Keep shared logic in `packages/` and import via workspace names.
- Keep infra separate in `infra/` when adding platform or service definitions.
- Prefer explicit types at public boundaries and structured outputs for AI features.

## References

- Architecture and refactoring rules: `.opencode/architecture.md`.
- Tooling and workflow expectations: `.opencode/tooling.md`.
- Skill loading rules: `.opencode/skills.md`.
