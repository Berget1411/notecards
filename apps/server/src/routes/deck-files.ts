import { auth } from "@notecards/auth";
import { db } from "@notecards/db";
import { deck } from "@notecards/db/schema/workspace";
import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const PDF_KEY_SUFFIX = "source.pdf";

export const deckFileRoutes = new Hono<{ Bindings: Env }>();

type DeckFileContext = Context<{ Bindings: Env }>;

async function getAuthedDeck(c: DeckFileContext) {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	if (!session) {
		return { error: c.json({ error: "Authentication required" }, 401) };
	}

	const deckId = Number(c.req.param("deckId"));
	if (!Number.isFinite(deckId)) {
		return { error: c.json({ error: "Invalid deck id" }, 400) };
	}

	const deckRecord = await db.query.deck.findFirst({
		where: eq(deck.id, deckId),
		with: {
			workspace: true,
		},
	});

	if (!deckRecord || deckRecord.workspace.userId !== session.user.id) {
		return { error: c.json({ error: "Deck not found" }, 404) };
	}

	return { deckId, deckRecord, session };
}

deckFileRoutes.post("/:deckId/pdf", async (c) => {
	const authResult = await getAuthedDeck(c);
	if ("error" in authResult) return authResult.error;

	const formData = await c.req.formData();
	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return c.json({ error: "PDF file is required" }, 400);
	}
	const pdfFile = file as File;

	const fileName = pdfFile.name || "document.pdf";
	const isPdf =
		pdfFile.type === "application/pdf" ||
		fileName.toLowerCase().endsWith(".pdf");
	if (!isPdf) {
		return c.json({ error: "Only PDF files are supported" }, 400);
	}

	if (pdfFile.size > MAX_PDF_BYTES) {
		return c.json(
			{ error: `PDF must be smaller than ${MAX_PDF_BYTES / 1024 / 1024}MB` },
			413,
		);
	}

	const key = `decks/${authResult.deckId}/${PDF_KEY_SUFFIX}`;
	await c.env.R2_DECK_PDFS.put(key, await pdfFile.arrayBuffer(), {
		httpMetadata: {
			contentType: "application/pdf",
		},
	});

	const origin = new URL(c.req.url).origin;
	const pdfUrl = `${origin}/decks/${authResult.deckId}/pdf`;

	await db
		.update(deck)
		.set({
			pdfUrl,
			pdfOriginalName: fileName,
		})
		.where(eq(deck.id, authResult.deckId));

	return c.json({ pdfUrl, pdfOriginalName: fileName });
});

deckFileRoutes.get("/:deckId/pdf", async (c) => {
	const authResult = await getAuthedDeck(c);
	if ("error" in authResult) return authResult.error;

	const key = `decks/${authResult.deckId}/${PDF_KEY_SUFFIX}`;
	const object = await c.env.R2_DECK_PDFS.get(key);
	if (!object) {
		return c.json({ error: "PDF not found" }, 404);
	}

	const fileName = authResult.deckRecord.pdfOriginalName ?? "deck.pdf";
	return c.body(object.body, 200, {
		"Content-Type": object.httpMetadata?.contentType ?? "application/pdf",
		"Content-Disposition": `inline; filename="${fileName}"`,
		"Cache-Control": "private, max-age=0, must-revalidate",
	});
});
