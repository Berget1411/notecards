"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { updateUserSchema } from "../auth-schema";

export function AccountTab() {
	const { data: session } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onSubmit: updateUserSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.updateUser({
					name: value.name,
				});
				toast.success("Account updated successfully");
			} catch (error) {
				toast.error("Failed to update account");
				console.error("Error updating account:", error);
			}
		},
	});

	// Update form when session data is available
	useEffect(() => {
		if (session?.user) {
			form.setFieldValue("name", session.user.name ?? "");
		}
	}, [session?.user, form]);

	return (
		<div>
			<div>
				<h1>Account</h1>
				<p className="text-muted-foreground text-sm">
					Manage your account settings
				</p>
				<Separator className="my-4" />

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<div className="flex flex-col gap-6">
							<Avatar className="size-16">
								<AvatarImage src={session?.user?.image ?? undefined} />
								<AvatarFallback>
									{session?.user?.name?.charAt(0)}
								</AvatarFallback>
							</Avatar>

							<form.Field name="name">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Name</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Enter your name"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<div className="space-y-2">
								<FieldLabel>Email</FieldLabel>
								<Input value={session?.user?.email ?? ""} disabled />
								<FieldDescription>Email cannot be changed</FieldDescription>
							</div>

							<Button
								type="submit"
								disabled={form.state.isSubmitting}
								className="w-fit"
							>
								{form.state.isSubmitting ? "Saving..." : "Save"}
							</Button>
						</div>
					</FieldGroup>
				</form>
			</div>
		</div>
	);
}
