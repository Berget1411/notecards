---
name: frontend-dev
description: Build and maintain Next.js frontend features with Tailwind and shadcn/ui in this monorepo.
compatibility: opencode
metadata:
  stack: nextjs
  ui: tailwind-shadcn
---

## What I do

- Build or update Next.js pages, routes, and layouts in `apps/web/`
- Compose UI with shadcn/ui components and Tailwind utilities before custom CSS
- Keep shared UI logic minimal and colocated with the feature or a small local module
- Ensure client/server boundaries are explicit, typed, and aligned with Next.js conventions
- Preserve established design system patterns when working in existing UI surfaces
- Favor clear, intentional layouts that hold up on mobile and desktop
- Fetch backend data with tRPC patterns used in `apps/web/src/app/todos/page.tsx`
- Stream AI responses with the `useChat` + `DefaultChatTransport` setup in `apps/web/src/app/ai/page.tsx`
- Handle auth through `authClient` from `apps/web/src/lib/auth-client.ts` (Better Auth + Polar plugin)
- Keep the app shell consistent with `apps/web/src/app/layout.tsx` and `apps/web/src/components/providers.tsx`
- Use `@/utils/trpc` for typed tRPC calls and React Query integration
- Keep auth flows aligned with `apps/web/src/components/auth/*` patterns and toast handling
- Prefer `@/components/ui/*` primitives and `cn` from `@/lib/utils`
- Apply layout, spacing, typography, and color using Tailwind utilities
- Extend existing tokens or CSS variables before adding custom CSS
- Keep styles consistent with shadcn/ui conventions and the current theme
- Choose expressive typography; avoid default stacks like Inter, Roboto, Arial, or system
- Define a clear visual direction with deliberate color choices and CSS variables
- Avoid purple-on-white defaults and avoid dark-mode bias unless the design demands it
- Use layered backgrounds (gradients, shapes, or subtle patterns) instead of flat fills
- Add a few meaningful animations (page load, staggered reveals) over generic micro-motions
- Ensure layouts feel intentional and deliberate, not boilerplate or interchangeable
- Verify the page reads well on both desktop and mobile
- Update theme tokens in `apps/web/src/index.css` using the existing oklch CSS variables
- Keep `:root` and `.dark` palettes in sync when adjusting theme colors
- Maintain token mappings in the `@theme inline` block (radii, colors, sidebar tokens)
- Respect global typography wiring from `apps/web/src/app/layout.tsx` and `apps/web/src/index.css`
- Favor `bg-background`, `text-foreground`, and `border-border` conventions for surfaces
- Use `tw-animate-css` or Tailwind utilities for motion instead of bespoke keyframes

## When to use me

Use this skill for feature work in the web app, including component changes, routing, and client state.
Use it when you need to follow the repo UI conventions: Tailwind + shadcn/ui, minimal custom CSS, and typed boundaries.
Use it for frontend-backend integrations with tRPC, AI streaming, or auth flows.
Use it when modifying the app shell, providers, or shared UI utilities.
Use it for visual presentation, layout, styling, and theme token updates.
