import { db } from "@notecards/db";
import { workspace } from "@notecards/db/schema/workspace";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router } from "../index";

export const workspaceRouter = router({
	getAllWithDecks: protectedProcedure.query(async ({ ctx }) => {
		return await db.query.workspace.findMany({
			where: eq(workspace.userId, ctx.session.user.id),
			orderBy: (workspaces, { asc }) => [asc(workspaces.order)],
			with: {
				decks: {
					orderBy: (decks, { asc }) => [asc(decks.order)],
				},
			},
		});
	}),
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const lastWorkspace = await db.query.workspace.findFirst({
				where: eq(workspace.userId, ctx.session.user.id),
				orderBy: (workspaces, { desc }) => [desc(workspaces.order)],
			});
			const nextOrder = (lastWorkspace?.order ?? -1) + 1;
			const [createdWorkspace] = await db
				.insert(workspace)
				.values({
					name: input.name,
					order: nextOrder,
					userId: ctx.session.user.id,
				})
				.returning();
			return createdWorkspace;
		}),
	updateOrder: protectedProcedure
		.input(
			z.object({
				workspaceOrders: z.array(
					z.object({ id: z.number(), order: z.number() }),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await Promise.all(
				input.workspaceOrders.map((workspaceOrder) =>
					db
						.update(workspace)
						.set({ order: workspaceOrder.order })
						.where(
							and(
								eq(workspace.id, workspaceOrder.id),
								eq(workspace.userId, ctx.session.user.id),
							),
						),
				),
			);
			return { success: true };
		}),
});
