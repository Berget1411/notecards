import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const workspace = pgTable("workspace", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	order: integer("order").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	pinned: boolean("pinned").default(false),
	pinnedOrder: integer("pinned_order"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const deck = pgTable("deck", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	order: integer("order").notNull(),
	description: text("description"),
	starred: boolean("starred").default(false),
	workspaceId: integer("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	icon: text("icon"),
	pdfUrl: text("pdf_url"),
	pdfOriginalName: text("pdf_original_name"),
	pdfSummary: text("pdf_summary"),
	pdfQuestions: text("pdf_questions"),
	pinned: boolean("pinned").default(false),
	pinnedOrder: integer("pinned_order"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const workspaceRelations = relations(workspace, ({ many, one }) => ({
	decks: many(deck),
	user: one(user, {
		fields: [workspace.userId],
		references: [user.id],
	}),
}));

export const deckRelations = relations(deck, ({ one }) => ({
	workspace: one(workspace, {
		fields: [deck.workspaceId],
		references: [workspace.id],
	}),
}));
