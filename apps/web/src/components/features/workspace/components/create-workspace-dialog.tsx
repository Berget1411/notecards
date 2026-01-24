"use client";

import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";

interface CreateWorkspaceDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: () => void;
}

export function CreateWorkspaceDialog({
	open,
	setOpen,
	onSuccess,
}: CreateWorkspaceDialogProps) {
	const [name, setName] = useState("");

	const createWorkspaceMutation = useMutation(
		trpc.workspace.create.mutationOptions({
			onSuccess: () => {
				onSuccess?.();
				setName("");
				setOpen(false);
			},
		}),
	);

	useEffect(() => {
		if (!open) {
			setName("");
		}
	}, [open]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) return;
		createWorkspaceMutation.mutate({ name: trimmedName });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create workspace</DialogTitle>
					<DialogDescription>
						Group decks and documents by project.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="workspace-name">Workspace name</Label>
						<Input
							id="workspace-name"
							placeholder="New workspace"
							value={name}
							onChange={(event) => setName(event.target.value)}
							disabled={createWorkspaceMutation.isPending}
						/>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!name.trim() || createWorkspaceMutation.isPending}
						>
							{createWorkspaceMutation.isPending
								? "Creating..."
								: "Create workspace"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
