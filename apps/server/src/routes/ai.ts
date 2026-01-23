import { createAgentUIStreamResponse } from "ai";
import { Hono } from "hono";
import { exampleAgent } from "../agent/example-agent";

export const aiRoutes = new Hono();

aiRoutes.post("/", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];

	return createAgentUIStreamResponse({
		agent: exampleAgent,
		uiMessages,
	});
});
