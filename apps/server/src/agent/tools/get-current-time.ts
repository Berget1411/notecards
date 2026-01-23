import { tool } from "ai";
import { z } from "zod";

export const getCurrentTimeTool = tool({
	description: "Get the current server time in ISO format.",
	inputSchema: z.object({
		timezone: z
			.string()
			.optional()
			.describe("Optional IANA timezone, e.g. 'UTC'."),
	}),
	execute: async ({ timezone }) => {
		const now = new Date();
		return {
			iso: now.toISOString(),
			timezone: timezone ?? "UTC",
		};
	},
});
