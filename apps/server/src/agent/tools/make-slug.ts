import { tool } from "ai";
import { z } from "zod";

export const makeSlugTool = tool({
	description: "Generate a URL-friendly slug from text.",
	inputSchema: z.object({
		text: z.string().min(1),
	}),
	execute: async ({ text }) => {
		const slug = text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
		return { slug };
	},
});
