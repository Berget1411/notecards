"use client";

import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { baseFetch } from "@/utils/base-fetch";
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
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const workspaceReady = typeof workspaceId === "number";

	const createDeckMutation = useMutation(trpc.deck.create.mutationOptions());
	const uploadPdfMutation = useMutation({
		mutationFn: async (payload: { deckId: number; file: File }) => {
			const formData = new FormData();
			formData.append("file", payload.file);
			await baseFetch(`/decks/${payload.deckId}/pdf`, {
				method: "POST",
				body: formData,
			});
		},
	});

	useEffect(() => {
		if (!open) {
			setName("");
			setPdfFile(null);
		}
	}, [open]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName || !workspaceReady || workspaceId === undefined) return;
		try {
			const createdDeck = await createDeckMutation.mutateAsync({
				workspaceId,
				name: trimmedName,
			});
			if (pdfFile) {
				await uploadPdfMutation.mutateAsync({
					deckId: createdDeck.id,
					file: pdfFile,
				});
			}
			onSuccess?.();
			setName("");
			setPdfFile(null);
			setOpen(false);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to create deck";
			toast.error(message);
		}
	};

	const isBusy = createDeckMutation.isPending || uploadPdfMutation.isPending;

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
							disabled={isBusy}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="deck-pdf">PDF (optional)</Label>
						<Input
							id="deck-pdf"
							type="file"
							accept="application/pdf"
							onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
							disabled={isBusy}
						/>
					</div>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!workspaceReady || !name.trim() || isBusy}
						>
							{isBusy ? "Creating..." : "Create deck"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
