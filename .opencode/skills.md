# Agent Skills

- Proactively load a relevant skill when a task matches its scope; treat skills as the default guidance source.
- If multiple skills apply, load the most specific one first, then others as needed.
- When unsure, briefly scan the task for frontend-dev, backend-dev, ai-dev, vercel-react-best-practices, or wrangler (Cloudflare) triggers before proceeding.
- Use skills early, before planning or editing, so implementation follows the expected patterns.
- Load the wrangler skill for Cloudflare Workers, R2, D1, KV, Queues, Vectorize, Hyperdrive, or any wrangler CLI tasks.
