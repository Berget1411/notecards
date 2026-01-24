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

interface CreateDeckDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	workspaceId?: number;
	onSuccess?: () => void;
}

export function CreateDeckDialog({
	open,
	setOpen,
	workspaceId,
	onSuccess,
}: CreateDeckDialogProps) {
	const [name, setName] = useState("");
	const workspaceReady = typeof workspaceId === "number";

	const createDeckMutation = useMutation(
		trpc.deck.create.mutationOptions({
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
		if (!trimmedName || !workspaceReady || workspaceId === undefined) return;
		createDeckMutation.mutate({
			workspaceId,
			name: trimmedName,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create deck</DialogTitle>
					<DialogDescription>
						Add a new deck to keep related notes together.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="deck-name">Deck name</Label>
						<Input
							id="deck-name"
							placeholder="New deck"
							value={name}
							onChange={(event) => setName(event.target.value)}
							disabled={createDeckMutation.isPending}
						/>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={
								!workspaceReady || !name.trim() || createDeckMutation.isPending
							}
						>
							{createDeckMutation.isPending ? "Creating..." : "Create deck"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
