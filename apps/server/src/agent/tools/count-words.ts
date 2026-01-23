import { tool } from "ai";
import { z } from "zod";

export const countWordsTool = tool({
	description: "Count the words in a string.",
	inputSchema: z.object({
		text: z.string().min(1),
	}),
	execute: async ({ text }) => {
		const words = text.trim().split(/\s+/).filter(Boolean);
		return {
			count: words.length,
		};
	},
});
