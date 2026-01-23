import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@notecards/api/context";
import { appRouter } from "@notecards/api/routers/index";
import { auth } from "@notecards/auth";
import { env } from "@notecards/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { aiRoutes } from "./routes/ai";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.route("/ai", aiRoutes);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
