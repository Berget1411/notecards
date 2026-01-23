import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(2),
});

export const updateUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters."),
});

export type InferUpdateUserSchema = z.infer<typeof updateUserSchema>;
