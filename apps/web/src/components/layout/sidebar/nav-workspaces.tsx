"use client";

import type { Modifier } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronDown,
	Ellipsis,
	FileText,
	Folder,
	GripVertical,
	MoreHorizontal,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateDeckDialog } from "@/components/features/deck/components/create-deck-dialog";
import { CreateWorkspaceDialog } from "@/components/features/workspace/components/create-workspace-dialog";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface WorkspaceItemProps {
	workspace: {
		id: number;
		name: string;
		order: number;
		userId: string;
		createdAt: string;
		updatedAt: string;
		pinned: boolean | null;
		pinnedOrder: number | null;
		decks: {
			id: number;
			name: string;
			order: number;
			description: string | null;
			starred: boolean | null;
			workspaceId: number;
			icon: string | null;
			pdfUrl: string | null;
			pdfOriginalName: string | null;
			pdfSummary: string | null;
			pdfQuestions: string | null;
			createdAt: string;
			updatedAt: string;
			pinned: boolean | null;
			pinnedOrder: number | null;
		}[];
	};
	onCreateDeck: (workspaceId: number) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSortable?: boolean;
}

interface DeckItemProps {
	deck: WorkspaceItemProps["workspace"]["decks"][number];
	workspaceId: number;
}

// Custom modifier to restrict to first ancestor scrollable container
const restrictToFirstScrollableAncestor: Modifier = ({
	draggingNodeRect,
	transform,
}) => {
	if (!draggingNodeRect) {
		return transform;
	}

	return {
		...transform,
		y: Math.max(transform.y, -draggingNodeRect.top),
	};
};

function SortableWorkspaceItem({
	workspace,
	onCreateDeck,
	open,
	onOpenChange,
	isSortable = true,
	children,
}: PropsWithChildren<WorkspaceItemProps>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: getWorkspaceSortableId(workspace.id),
		data: { type: "workspace", workspaceId: workspace.id },
		disabled: !isSortable,
	});
	const { state } = useSidebar();
	const showDragHandle = isSortable && state !== "collapsed";

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<Collapsible open={open} onOpenChange={onOpenChange}>
			<SidebarMenuItem
				ref={setNodeRef}
				style={style}
				className={cn(isDragging && "opacity-60")}
			>
				<SidebarMenuButton asChild>
					<CollapsibleTrigger asChild>
						<button type="button" className="flex w-full items-center gap-2">
							{showDragHandle ? (
								<span
									ref={setActivatorNodeRef}
									{...attributes}
									{...listeners}
									className="text-sidebar-foreground/50"
								>
									<GripVertical className="size-4" />
								</span>
							) : null}
							<Folder className="size-4" />
							<span className="flex-1 truncate">{workspace.name}</span>
							<ChevronDown
								className={cn(
									"size-4 text-sidebar-foreground/70 transition-transform",
									open ? "rotate-0" : "-rotate-90",
								)}
							/>
						</button>
					</CollapsibleTrigger>
				</SidebarMenuButton>
				<SidebarMenuAction
					onClick={(event) => {
						event.stopPropagation();
						onCreateDeck(workspace.id);
					}}
					showOnHover
					className="rounded-sm"
				>
					<Plus />
					<span className="sr-only">Create deck</span>
				</SidebarMenuAction>
			</SidebarMenuItem>
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	);
}

function SortableDeckItem({ deck, workspaceId }: DeckItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: deck.id,
		data: { type: "deck", workspaceId },
	});
	const { state } = useSidebar();
	const showDragHandle = state !== "collapsed";

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<SidebarMenuSubItem
			ref={setNodeRef}
			style={style}
			className={cn(isDragging && "opacity-60")}
		>
			<SidebarMenuSubButton asChild>
				<button type="button" className="flex items-center gap-2">
					{showDragHandle ? (
						<span
							ref={setActivatorNodeRef}
							{...attributes}
							{...listeners}
							className="text-sidebar-foreground/50"
						>
							<GripVertical className="size-3.5" />
						</span>
					) : null}
					<FileText className="size-4" />
					<span className="flex-1 truncate">{deck.name}</span>
				</button>
			</SidebarMenuSubButton>
		</SidebarMenuSubItem>
	);
}

const getWorkspaceSortableId = (workspaceId: number) =>
	`workspace-item-${workspaceId}`;
const getDeckDropZoneId = (workspaceId: number) =>
	`workspace-drop-${workspaceId}`;

function WorkspaceDeckList({
	workspace,
}: {
	workspace: WorkspaceItemProps["workspace"];
}) {
	const { isOver, setNodeRef } = useDroppable({
		id: getDeckDropZoneId(workspace.id),
		data: { type: "workspace-drop", workspaceId: workspace.id },
	});

	return (
		<SortableContext
			items={workspace.decks.map((deckItem) => deckItem.id)}
			strategy={verticalListSortingStrategy}
		>
			<SidebarMenuSub
				ref={setNodeRef}
				className={cn(isOver && "bg-sidebar-accent/40")}
			>
				{workspace.decks.map((deckItem) => (
					<SortableDeckItem
						key={deckItem.id}
						deck={deckItem}
						workspaceId={workspace.id}
					/>
				))}
			</SidebarMenuSub>
		</SortableContext>
	);
}

function WorkspaceListSkeleton({ count }: { count: number }) {
	const workspaceSkeletons = useMemo(
		() =>
			Array.from({ length: count }, () => ({
				id: globalThis.crypto.randomUUID(),
			})),
		[count],
	);

	return (
		<SidebarMenu>
			{workspaceSkeletons.map((skeleton) => (
				<SidebarMenuItem key={skeleton.id}>
					<SidebarMenuButton className="pointer-events-none">
						<div className="flex w-full items-center gap-2">
							<Skeleton className="size-3.5 rounded-sm" />
							<Skeleton className="size-4 rounded-sm" />
							<Skeleton className="h-4 w-28" />
							<Skeleton className="ml-auto size-3.5 rounded-sm" />
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}

interface NavWorkspacesProps {
	pinned?: boolean;
	openWorkspaceId?: number | null;
	setOpenWorkspaceId?: (workspaceId: number | null) => void;
}

export function NavWorkspaces({
	pinned = false,
	openWorkspaceId: openWorkspaceIdProp,
	setOpenWorkspaceId: setOpenWorkspaceIdProp,
}: NavWorkspacesProps) {
	const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] =
		useState(false);
	const [createDeckDialogState, setCreateDeckDialogState] = useState<{
		open: boolean;
		workspaceId?: number;
	}>({
		open: false,
		workspaceId: undefined,
	});
	const [localOpenWorkspaceId, setLocalOpenWorkspaceId] = useState<
		number | null
	>(null);
	const openWorkspaceId = openWorkspaceIdProp ?? localOpenWorkspaceId;
	const setOpenWorkspaceId = setOpenWorkspaceIdProp ?? setLocalOpenWorkspaceId;

	const queryClient = useQueryClient();
	const {
		data: workspaces = [],
		refetch,
		isLoading,
	} = useQuery(trpc.workspace.getAllWithDecks.queryOptions());
	const visibleWorkspaces = workspaces.filter((workspace) =>
		pinned ? workspace.pinned : !workspace.pinned,
	);
	const allowWorkspaceSorting = true;

	useEffect(() => {
		if (
			openWorkspaceId !== null &&
			!workspaces.some((workspace) => workspace.id === openWorkspaceId)
		) {
			setOpenWorkspaceId(null);
		}
	}, [openWorkspaceId, setOpenWorkspaceId, workspaces]);

	const updateDeckPositionsMutation = useMutation(
		trpc.deck.updatePositions.mutationOptions({
			onMutate: async ({ updates }) => {
				await queryClient.cancelQueries({
					queryKey: trpc.workspace.getAllWithDecks.queryKey(),
				});

				const previousWorkspaces = queryClient.getQueryData(
					trpc.workspace.getAllWithDecks.queryKey(),
				);

				queryClient.setQueryData(
					trpc.workspace.getAllWithDecks.queryKey(),
					(old: WorkspaceItemProps["workspace"][] | undefined) => {
						if (!old) return old;
						const updateMap = new Map(
							updates.map((update) => [update.id, update]),
						);
						const deckMap = new Map(
							old.flatMap((ws) => ws.decks.map((deck) => [deck.id, deck])),
						);
						const nextWorkspaces = old.map((ws) => ({
							...ws,
							decks: [] as typeof ws.decks,
						}));
						const workspaceMap = new Map(
							nextWorkspaces.map((ws) => [ws.id, ws]),
						);

						deckMap.forEach((deckItem) => {
							const update = updateMap.get(deckItem.id);
							const targetWorkspaceId =
								update?.workspaceId ?? deckItem.workspaceId;
							const targetWorkspace = workspaceMap.get(targetWorkspaceId);
							if (!targetWorkspace) return;
							targetWorkspace.decks.push({
								...deckItem,
								workspaceId: targetWorkspaceId,
								order: update?.order ?? deckItem.order,
							});
						});

						nextWorkspaces.forEach((ws) => {
							ws.decks.sort((a, b) => a.order - b.order);
						});

						return nextWorkspaces;
					},
				);

				return { previousWorkspaces };
			},
			onError: (error, _variables, context) => {
				if (context?.previousWorkspaces) {
					queryClient.setQueryData(
						trpc.workspace.getAllWithDecks.queryKey(),
						context.previousWorkspaces,
					);
				}
				toast.error(`Failed to update deck order: ${error.message}`);
			},
			onSettled: (_data, _error, variables) => {
				queryClient.invalidateQueries({
					queryKey: trpc.workspace.getAllWithDecks.queryKey(),
				});
				if (variables) {
					const workspaceIds = new Set(
						variables.updates.map((update) => update.workspaceId),
					);
					workspaceIds.forEach((workspaceId) => {
						queryClient.invalidateQueries({
							queryKey: trpc.deck.getAll.queryKey({ workspaceId }),
						});
					});
				}
			},
		}),
	);

	// Mutation for updating workspace order
	const updateWorkspaceOrderMutation = useMutation(
		trpc.workspace.updateOrder.mutationOptions({
			onMutate: async ({ workspaceOrders }) => {
				// Cancel outgoing refetches
				await queryClient.cancelQueries({
					queryKey: trpc.workspace.getAllWithDecks.queryKey(),
				});

				// Snapshot previous value
				const previousWorkspaces = queryClient.getQueryData(
					trpc.workspace.getAllWithDecks.queryKey(),
				);

				// Optimistically update - reorder the workspaces array based on new order
				queryClient.setQueryData(
					trpc.workspace.getAllWithDecks.queryKey(),
					(old: WorkspaceItemProps["workspace"][] | undefined) => {
						if (!old) return old;

						// Create a map of workspace id to new order
						const orderMap = new Map(
							workspaceOrders.map((workspaceOrder) => [
								workspaceOrder.id,
								workspaceOrder.order,
							]),
						);

						// Update order field and sort by new order
						return old
							.map((ws) => ({
								...ws,
								order: orderMap.get(ws.id) ?? ws.order,
							}))
							.sort((a, b) => a.order - b.order);
					},
				);

				return { previousWorkspaces };
			},
			onError: (error, _variables, context) => {
				// Rollback on error
				if (context?.previousWorkspaces) {
					queryClient.setQueryData(
						trpc.workspace.getAllWithDecks.queryKey(),
						context.previousWorkspaces,
					);
				}
				toast.error(`Failed to update workspace order: ${error.message}`);
			},
			onSettled: () => {
				// Refetch after mutation
				queryClient.invalidateQueries({
					queryKey: trpc.workspace.getAllWithDecks.queryKey(),
				});
			},
		}),
	);

	// Configure drag and drop sensors with activation constraints
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Require 8px movement before drag starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const findWorkspaceByDeckId = (deckId: number) =>
		workspaces.find((workspace) =>
			workspace.decks.some((deckItem) => deckItem.id === deckId),
		);

	const getWorkspaceIdFromOver = (overItem: DragEndEvent["over"]) => {
		if (!overItem) return undefined;
		const dataWorkspaceId = overItem.data.current?.workspaceId;
		if (typeof dataWorkspaceId === "number") {
			return dataWorkspaceId;
		}
		if (typeof overItem.id === "string") {
			if (overItem.id.startsWith("workspace-drop-")) {
				return Number(overItem.id.replace("workspace-drop-", ""));
			}
			if (overItem.id.startsWith("workspace-item-")) {
				return Number(overItem.id.replace("workspace-item-", ""));
			}
			return undefined;
		}
		if (typeof overItem.id === "number") {
			return findWorkspaceByDeckId(overItem.id)?.id;
		}
		return undefined;
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeType = active.data.current?.type;
		const overType = over.data.current?.type;
		if (activeType === "workspace") {
			if (overType !== "workspace") return;
			const activeWorkspaceId = active.data.current?.workspaceId;
			const overWorkspaceId = over.data.current?.workspaceId;
			if (
				typeof activeWorkspaceId !== "number" ||
				typeof overWorkspaceId !== "number" ||
				activeWorkspaceId === overWorkspaceId
			) {
				return;
			}
			const oldIndex = visibleWorkspaces.findIndex(
				(workspace) => workspace.id === activeWorkspaceId,
			);
			const newIndex = visibleWorkspaces.findIndex(
				(workspace) => workspace.id === overWorkspaceId,
			);
			if (oldIndex !== -1 && newIndex !== -1) {
				const newOrder = arrayMove(visibleWorkspaces, oldIndex, newIndex);
				const workspaceOrders = newOrder.map((workspaceItem, index) => ({
					id: workspaceItem.id,
					order: index,
				}));
				updateWorkspaceOrderMutation.mutate({ workspaceOrders });
			}
			return;
		}

		if (activeType !== "deck") return;
		const activeWorkspaceId = active.data.current?.workspaceId;
		if (typeof activeWorkspaceId !== "number") return;

		const overWorkspaceId = getWorkspaceIdFromOver(over);
		if (!overWorkspaceId) return;

		const sourceWorkspace = workspaces.find(
			(workspace) => workspace.id === activeWorkspaceId,
		);
		const destinationWorkspace = workspaces.find(
			(workspace) => workspace.id === overWorkspaceId,
		);
		if (!sourceWorkspace || !destinationWorkspace) return;

		const sourceIndex = sourceWorkspace.decks.findIndex(
			(deckItem) => deckItem.id === active.id,
		);
		if (sourceIndex === -1) return;

		const overIsDeck = typeof over.id === "number";

		if (activeWorkspaceId === overWorkspaceId) {
			const destinationIndex = overIsDeck
				? destinationWorkspace.decks.findIndex(
						(deckItem) => deckItem.id === over.id,
					)
				: destinationWorkspace.decks.length - 1;
			if (destinationIndex === -1 || sourceIndex === destinationIndex) return;

			const newOrder = arrayMove(
				destinationWorkspace.decks,
				sourceIndex,
				destinationIndex,
			);
			const updates = newOrder.map((deckItem, index) => ({
				id: deckItem.id,
				workspaceId: activeWorkspaceId,
				order: index,
			}));
			updateDeckPositionsMutation.mutate({ updates });
			return;
		}

		const sourceDecks = [...sourceWorkspace.decks];
		const [movedDeck] = sourceDecks.splice(sourceIndex, 1);
		const destinationDecks = [...destinationWorkspace.decks];
		let destinationIndex = destinationDecks.length;
		if (overIsDeck) {
			const overIndex = destinationDecks.findIndex(
				(deckItem) => deckItem.id === over.id,
			);
			if (overIndex !== -1) {
				destinationIndex = overIndex;
			}
		}
		destinationDecks.splice(destinationIndex, 0, {
			...movedDeck,
			workspaceId: overWorkspaceId,
		});
		const updates = [
			...sourceDecks.map((deckItem, index) => ({
				id: deckItem.id,
				workspaceId: activeWorkspaceId,
				order: index,
			})),
			...destinationDecks.map((deckItem, index) => ({
				id: deckItem.id,
				workspaceId: overWorkspaceId,
				order: index,
			})),
		];
		updateDeckPositionsMutation.mutate({ updates });
	};

	const handleDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === "workspace") {
			setOpenWorkspaceId(null);
		}
	};

	const handleCreateDeck = (workspaceId: number) => {
		setCreateDeckDialogState({
			open: true,
			workspaceId,
		});
	};

	return (
		<>
			<CreateWorkspaceDialog
				open={openCreateWorkspaceDialog}
				setOpen={setOpenCreateWorkspaceDialog}
				onSuccess={() => refetch()}
			/>
			<CreateDeckDialog
				open={createDeckDialogState.open}
				setOpen={(open: boolean) =>
					setCreateDeckDialogState({ ...createDeckDialogState, open })
				}
				workspaceId={createDeckDialogState.workspaceId}
				onSuccess={() => refetch()}
			/>
			<SidebarGroup>
				<SidebarGroupLabel>
					<div className="flex w-full items-center justify-between gap-2">
						<Link href="/dashboard">{pinned ? "Pinned" : "Workspaces"}</Link>
						{pinned ? null : (
							<div className="flex items-center gap-2">
								<Ellipsis className="size-4 cursor-pointer" />
								<Plus
									className="size-4 cursor-pointer"
									onClick={() => setOpenCreateWorkspaceDialog(true)}
								/>
							</div>
						)}
					</div>
				</SidebarGroupLabel>
				<SidebarGroupContent>
					{isLoading ? (
						<WorkspaceListSkeleton count={pinned ? 2 : 3} />
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
							modifiers={[
								restrictToVerticalAxis,
								restrictToFirstScrollableAncestor,
							]}
						>
							<SidebarMenu>
								<SortableContext
									items={visibleWorkspaces.map((workspace) =>
										getWorkspaceSortableId(workspace.id),
									)}
									strategy={verticalListSortingStrategy}
								>
									{visibleWorkspaces.map((workspace) => (
										<SortableWorkspaceItem
											key={workspace.id}
											workspace={workspace}
											onCreateDeck={handleCreateDeck}
											open={openWorkspaceId === workspace.id}
											isSortable={allowWorkspaceSorting}
											onOpenChange={(open: boolean) =>
												setOpenWorkspaceId(open ? workspace.id : null)
											}
										>
											<WorkspaceDeckList workspace={workspace} />
										</SortableWorkspaceItem>
									))}
								</SortableContext>
								{pinned ? null : (
									<SidebarMenuItem>
										<SidebarMenuButton className="text-sidebar-foreground/70">
											<MoreHorizontal />
											<span>More</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)}
							</SidebarMenu>
						</DndContext>
					)}
				</SidebarGroupContent>
			</SidebarGroup>
		</>
	);
}
