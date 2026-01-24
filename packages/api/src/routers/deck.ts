import { db } from "@notecards/db";
import { deck, workspace } from "@notecards/db/schema/workspace";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

export const deckRouter = router({
	getAll: protectedProcedure
		.input(z.object({ workspaceId: z.number() }))
		.query(async ({ ctx, input }) => {
			const workspaceRecord = await db.query.workspace.findFirst({
				where: and(
					eq(workspace.id, input.workspaceId),
					eq(workspace.userId, ctx.session.user.id),
				),
			});
			if (!workspaceRecord) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workspace not found",
				});
			}
			return await db.query.deck.findMany({
				where: eq(deck.workspaceId, input.workspaceId),
				orderBy: (decks, { asc }) => [asc(decks.order)],
			});
		}),
	create: protectedProcedure
		.input(z.object({ workspaceId: z.number(), name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const workspaceRecord = await db.query.workspace.findFirst({
				where: and(
					eq(workspace.id, input.workspaceId),
					eq(workspace.userId, ctx.session.user.id),
				),
			});
			if (!workspaceRecord) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workspace not found",
				});
			}
			const lastDeck = await db.query.deck.findFirst({
				where: eq(deck.workspaceId, input.workspaceId),
				orderBy: (decks, { desc }) => [desc(decks.order)],
			});
			const nextOrder = (lastDeck?.order ?? -1) + 1;
			const [createdDeck] = await db
				.insert(deck)
				.values({
					name: input.name,
					order: nextOrder,
					workspaceId: input.workspaceId,
				})
				.returning();
			return createdDeck;
		}),
	updatePositions: protectedProcedure
		.input(
			z.object({
				updates: z.array(
					z.object({
						id: z.number(),
						workspaceId: z.number(),
						order: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const workspaceIds = Array.from(
				new Set(input.updates.map((update) => update.workspaceId)),
			);
			if (workspaceIds.length === 0) {
				return { success: true };
			}
			const userWorkspaces = await db.query.workspace.findMany({
				where: and(
					inArray(workspace.id, workspaceIds),
					eq(workspace.userId, ctx.session.user.id),
				),
			});
			if (userWorkspaces.length !== workspaceIds.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workspace not found",
				});
			}
			const deckIds = input.updates.map((update) => update.id);
			const userDecks = await db.query.deck.findMany({
				where: inArray(deck.id, deckIds),
				with: {
					workspace: true,
				},
			});
			if (userDecks.length !== deckIds.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Deck not found",
				});
			}
			const ownedDecks = userDecks.every(
				(deckItem) => deckItem.workspace.userId === ctx.session.user.id,
			);
			if (!ownedDecks) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Deck access denied",
				});
			}

			await Promise.all(
				input.updates.map((update) =>
					db
						.update(deck)
						.set({
							order: update.order,
							workspaceId: update.workspaceId,
						})
						.where(eq(deck.id, update.id)),
				),
			);
			return { success: true };
		}),
});
