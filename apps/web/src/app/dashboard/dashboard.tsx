"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Folder, FolderPlus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CreateDeckDialog } from "@/components/features/deck/components/create-deck-dialog";
import { CreateWorkspaceDialog } from "@/components/features/workspace/components/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function Dashboard() {
	const [search, setSearch] = useState("");
	const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] =
		useState(false);
	const [openCreateDeckDialog, setOpenCreateDeckDialog] = useState(false);
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
		null,
	);
	const {
		data: workspaces = [],
		isLoading,
		refetch,
	} = useQuery(trpc.workspace.getAllWithDecks.queryOptions());

	useEffect(() => {
		if (workspaces.length === 0) {
			setSelectedWorkspaceId(null);
			return;
		}
		setSelectedWorkspaceId((current) => {
			if (current && workspaces.some((workspace) => workspace.id === current)) {
				return current;
			}
			return workspaces[0]?.id ?? null;
		});
	}, [workspaces]);

	const selectedWorkspace = workspaces.find(
		(workspace) => workspace.id === selectedWorkspaceId,
	);

	const filteredDecks = useMemo(() => {
		if (!selectedWorkspace) return [];
		const normalized = search.trim().toLowerCase();
		if (!normalized) return selectedWorkspace.decks;
		return selectedWorkspace.decks.filter((deck) => {
			const haystack = `${deck.name} ${deck.description ?? ""}`.toLowerCase();
			return haystack.includes(normalized);
		});
	}, [search, selectedWorkspace]);

	const deckCountLabel = selectedWorkspace
		? `${selectedWorkspace.decks.length} deck${
				selectedWorkspace.decks.length === 1 ? "" : "s"
			}`
		: "No workspace selected";

	return (
		<div className="flex flex-col gap-6">
			<CreateWorkspaceDialog
				open={openCreateWorkspaceDialog}
				setOpen={setOpenCreateWorkspaceDialog}
				onSuccess={() => refetch()}
			/>
			<CreateDeckDialog
				open={openCreateDeckDialog}
				setOpen={setOpenCreateDeckDialog}
				workspaceId={selectedWorkspace?.id}
				onSuccess={() => refetch()}
			/>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg border bg-muted/30">
						<Folder className="size-5 text-muted-foreground" />
					</div>
					<div className="space-y-1">
						<p className="text-muted-foreground text-sm">Workspace</p>
						<h1 className="font-semibold text-2xl text-foreground">
							{selectedWorkspace?.name ?? "Workspaces"}
						</h1>
						<p className="text-muted-foreground text-sm">{deckCountLabel}</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					{workspaces.length > 1 ? (
						<Select
							value={selectedWorkspaceId?.toString() ?? ""}
							onValueChange={(value) => setSelectedWorkspaceId(Number(value))}
						>
							<SelectTrigger size="sm" className="min-w-[180px]">
								<SelectValue placeholder="Select workspace" />
							</SelectTrigger>
							<SelectContent align="end">
								{workspaces.map((workspace) => (
									<SelectItem
										key={workspace.id}
										value={workspace.id.toString()}
									>
										{workspace.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setOpenCreateWorkspaceDialog(true)}
					>
						New workspace
					</Button>
					<Button
						size="sm"
						onClick={() => setOpenCreateDeckDialog(true)}
						disabled={!selectedWorkspace}
					>
						New deck
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="font-medium text-muted-foreground text-sm">Decks</div>
				<div className="w-full max-w-sm">
					<InputGroup>
						<InputGroupAddon className="text-muted-foreground">
							<Search className="size-4" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Search this workspace"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</InputGroup>
				</div>
			</div>

			{isLoading ? (
				<ItemGroup className="gap-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<Item key={`deck-skeleton-${index}-${Math.random()}`} size="sm">
							<Skeleton className="size-9 rounded-md" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-56" />
							</div>
						</Item>
					))}
				</ItemGroup>
			) : selectedWorkspace ? (
				filteredDecks.length > 0 ? (
					<ItemGroup className="gap-2">
						{filteredDecks.map((deck) => (
							<Item
								key={deck.id}
								variant="outline"
								size="sm"
								className="rounded-lg"
							>
								<ItemMedia variant="icon" className="rounded-md">
									<BookOpen className="size-4" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{deck.name}</ItemTitle>
									<ItemDescription>
										{deck.description ?? "No description yet."}
									</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				) : (
					<Empty className="border-dashed">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<BookOpen className="size-5" />
							</EmptyMedia>
							<EmptyTitle>No decks yet</EmptyTitle>
							<EmptyDescription>
								Create a deck to organize your cards.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setOpenCreateDeckDialog(true)}>
								Create deck
							</Button>
						</EmptyContent>
					</Empty>
				)
			) : (
				<Empty className="border-dashed">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FolderPlus className="size-5" />
						</EmptyMedia>
						<EmptyTitle>Create your first workspace</EmptyTitle>
						<EmptyDescription>
							Workspaces keep decks and documents organized.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setOpenCreateWorkspaceDialog(true)}>
							Create workspace
						</Button>
					</EmptyContent>
				</Empty>
			)}
		</div>
	);
}
