import { openai } from "@ai-sdk/openai";
import { stepCountIs, ToolLoopAgent } from "ai";
import { countWordsTool, getCurrentTimeTool, makeSlugTool } from "./tools";

const instructions = `You are the Notecards example agent.

Behavior:
- Be concise and practical.
- Ask a single clarifying question only when required.
- Prefer using tools for time, word counts, and slug generation.

Output:
- Use short paragraphs and bullet lists when helpful.
- Avoid markdown tables unless asked.`;

const tools = {
	getCurrentTime: getCurrentTimeTool,
	countWords: countWordsTool,
	makeSlug: makeSlugTool,
};

export const exampleAgent = new ToolLoopAgent({
	model: openai("gpt-4o-mini"),
	instructions,
	tools,
	stopWhen: stepCountIs(12),
});
