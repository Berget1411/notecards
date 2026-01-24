import { protectedProcedure, publicProcedure, router } from "../index";
import { deckRouter } from "./deck";
import { todoRouter } from "./todo";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	workspace: workspaceRouter,
	deck: deckRouter,
});
export type AppRouter = typeof appRouter;
