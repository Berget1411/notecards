"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	Filter,
	LogOut,
	MoreHorizontal,
	Search,
	ShieldBan,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { AddUserDialog } from "./add-user-dialog";
// User type based on better-auth schema
export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
	role: string | null;
	banned: boolean | null;
	banReason: string | null;
	banExpires: Date | null;
};

// Column definitions factory
const createColumns = (
	queryClient: ReturnType<typeof useQueryClient>,
): ColumnDef<User>[] => [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const user = row.original;
			return (
				<div className="flex items-center gap-2">
					{user.image && (
						<Image
							src={user.image}
							alt={user.name}
							width={32}
							height={32}
							className="h-8 w-8 rounded-full"
						/>
					)}
					<span className="font-medium">{user.name}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Email
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const role = (row.getValue("role") as string | null) || "user";
			const [isLoading, setIsLoading] = React.useState(false);

			const handleRoleChange = async (newRole: string) => {
				setIsLoading(true);
				try {
					const { error } = await authClient.admin.setRole({
						userId: row.original.id,
						role: newRole as "admin" | "user",
					});

					if (error) {
						toast.error(error.message || "Failed to update role");
						return;
					}

					toast.success("Role updated successfully");
					// Invalidate the users query to refetch the data
					queryClient.invalidateQueries({ queryKey: ["admin-users"] });
				} catch {
					toast.error("Failed to update role");
				} finally {
					setIsLoading(false);
				}
			};

			return (
				<Select
					value={role}
					onValueChange={handleRoleChange}
					disabled={isLoading}
				>
					<SelectTrigger className="w-[110px]">{role}</SelectTrigger>
					<SelectContent>
						<SelectItem value="admin">Admin</SelectItem>
						<SelectItem value="user">User</SelectItem>
					</SelectContent>
				</Select>
			);
		},
	},
	{
		accessorKey: "emailVerified",
		header: "Verified",
		cell: ({ row }) => {
			const verified = row.getValue("emailVerified") as boolean;
			return (
				<Badge variant={verified ? "default" : "outline"}>
					{verified ? "Yes" : "No"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "banned",
		header: "Status",
		cell: ({ row }) => {
			const banned = row.getValue("banned") as boolean | null;
			return (
				<Badge variant={banned ? "destructive" : "default"}>
					{banned ? "Banned" : "Active"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Joined
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return <div>{date.toLocaleDateString()}</div>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const user = row.original;
			const [showBanDialog, setShowBanDialog] = React.useState(false);
			const [showUnbanDialog, setShowUnbanDialog] = React.useState(false);
			const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
			const [showRevokeSessionsDialog, setShowRevokeSessionsDialog] =
				React.useState(false);
			const [banReason, setBanReason] = React.useState("");
			const [banDays, setBanDays] = React.useState("7");
			const [isLoading, setIsLoading] = React.useState(false);

			const handleBanUser = async () => {
				setIsLoading(true);
				try {
					const { error } = await authClient.admin.banUser({
						userId: user.id,
						banReason: banReason || undefined,
						banExpiresIn: banDays ? Number(banDays) * 24 * 60 * 60 : undefined,
					});

					if (error) {
						toast.error(error.message || "Failed to ban user");
						return;
					}

					toast.success("User banned successfully");
					queryClient.invalidateQueries({ queryKey: ["admin-users"] });
					setShowBanDialog(false);
					setBanReason("");
					setBanDays("7");
				} catch {
					toast.error("Failed to ban user");
				} finally {
					setIsLoading(false);
				}
			};

			const handleUnbanUser = async () => {
				setIsLoading(true);
				try {
					const { error } = await authClient.admin.unbanUser({
						userId: user.id,
					});

					if (error) {
						toast.error(error.message || "Failed to unban user");
						return;
					}

					toast.success("User unbanned successfully");
					queryClient.invalidateQueries({ queryKey: ["admin-users"] });
					setShowUnbanDialog(false);
				} catch {
					toast.error("Failed to unban user");
				} finally {
					setIsLoading(false);
				}
			};

			const handleDeleteUser = async () => {
				setIsLoading(true);
				try {
					const { error } = await authClient.admin.removeUser({
						userId: user.id,
					});

					if (error) {
						toast.error(error.message || "Failed to delete user");
						return;
					}

					toast.success("User deleted successfully");
					queryClient.invalidateQueries({ queryKey: ["admin-users"] });
					setShowDeleteDialog(false);
				} catch {
					toast.error("Failed to delete user");
				} finally {
					setIsLoading(false);
				}
			};

			const handleRevokeAllSessions = async () => {
				setIsLoading(true);
				try {
					const { error } = await authClient.admin.revokeUserSessions({
						userId: user.id,
					});

					if (error) {
						toast.error(error.message || "Failed to revoke sessions");
						return;
					}

					toast.success("All sessions revoked successfully");
					setShowRevokeSessionsDialog(false);
				} catch {
					toast.error("Failed to revoke sessions");
				} finally {
					setIsLoading(false);
				}
			};

			return (
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(user.id);
									toast.success("User ID copied to clipboard");
								}}
							>
								Copy user ID
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									navigator.clipboard.writeText(user.email);
									toast.success("Email copied to clipboard");
								}}
							>
								Copy email
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Session Management</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => setShowRevokeSessionsDialog(true)}
							>
								<LogOut className="mr-2 h-4 w-4" />
								Revoke all sessions
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>User Management</DropdownMenuLabel>
							{user.banned ? (
								<DropdownMenuItem onClick={() => setShowUnbanDialog(true)}>
									<ShieldCheck className="mr-2 h-4 w-4" />
									Unban user
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem onClick={() => setShowBanDialog(true)}>
									<ShieldBan className="mr-2 h-4 w-4" />
									Ban user
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setShowDeleteDialog(true)}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete user
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Ban User Dialog */}
					<AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Ban User</AlertDialogTitle>
								<AlertDialogDescription>
									This will prevent {user.name} from signing in and revoke all
									their existing sessions.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="banReason">Reason (optional)</Label>
									<Textarea
										id="banReason"
										placeholder="Spamming, inappropriate behavior, etc."
										value={banReason}
										onChange={(e) => setBanReason(e.target.value)}
										disabled={isLoading}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="banDays">Ban duration (days)</Label>
									<Input
										id="banDays"
										type="number"
										placeholder="Leave empty for permanent ban"
										value={banDays}
										onChange={(e) => setBanDays(e.target.value)}
										disabled={isLoading}
										min="0"
									/>
									<p className="text-muted-foreground text-xs">
										Leave empty for a permanent ban
									</p>
								</div>
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isLoading}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										handleBanUser();
									}}
									disabled={isLoading}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isLoading ? "Banning..." : "Ban User"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* Unban User Dialog */}
					<AlertDialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Unban User</AlertDialogTitle>
								<AlertDialogDescription>
									This will allow {user.name} to sign in again.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isLoading}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										handleUnbanUser();
									}}
									disabled={isLoading}
								>
									{isLoading ? "Unbanning..." : "Unban User"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* Delete User Dialog */}
					<AlertDialog
						open={showDeleteDialog}
						onOpenChange={setShowDeleteDialog}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete User</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete {user.name} ({user.email}) from
									the database. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isLoading}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										handleDeleteUser();
									}}
									disabled={isLoading}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isLoading ? "Deleting..." : "Delete User"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* Revoke All Sessions Dialog */}
					<AlertDialog
						open={showRevokeSessionsDialog}
						onOpenChange={setShowRevokeSessionsDialog}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
								<AlertDialogDescription>
									This will sign out {user.name} from all devices and sessions.
									They will need to sign in again.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isLoading}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault();
										handleRevokeAllSessions();
									}}
									disabled={isLoading}
								>
									{isLoading ? "Revoking..." : "Revoke All Sessions"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			);
		},
	},
];

export function UserManagement() {
	const queryClient = useQueryClient();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [searchValue, setSearchValue] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [pageIndex, setPageIndex] = React.useState(0);
	const [searchField, setSearchField] = React.useState<"name" | "email">(
		"name",
	);
	const [filterRole, setFilterRole] = React.useState<string>("all");
	const pageSize = 10;

	// Create columns with query client access
	const columns = React.useMemo(
		() => createColumns(queryClient),
		[queryClient],
	);

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchValue);
			setPageIndex(0); // Reset to first page on search
		}, 300);

		return () => clearTimeout(timer);
	}, [searchValue]);

	// Fetch users using React Query
	const {
		data: usersData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: [
			"admin-users",
			debouncedSearch,
			pageIndex,
			pageSize,
			sorting[0]?.id,
			sorting[0]?.desc,
			searchField,
			filterRole,
		],
		queryFn: async () => {
			const result = await authClient.admin.listUsers({
				query: {
					searchValue: debouncedSearch || undefined,
					searchField: searchField,
					searchOperator: "contains",
					limit: pageSize,
					offset: pageIndex * pageSize,
					sortBy: sorting[0]?.id || "createdAt",
					sortDirection: sorting[0]?.desc ? "desc" : "asc",
					...(filterRole !== "all" && {
						filterField: "role",
						filterValue: filterRole,
						filterOperator: "eq",
					}),
				},
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to fetch users");
			}

			return result.data;
		},
		staleTime: 30000, // Consider data fresh for 30 seconds
	});

	// Show error toast when query fails
	React.useEffect(() => {
		if (isError && error) {
			toast.error(error.message);
		}
	}, [isError, error]);

	const data = usersData?.users as User[] | undefined;
	const totalUsers = usersData?.total || 0;

	const table = useReactTable({
		data: data || [],
		columns,
		pageCount: Math.ceil(totalUsers / pageSize),
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			pagination: {
				pageIndex,
				pageSize,
			},
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
		getSortedRowModel: getSortedRowModel(),
	});

	const totalPages = Math.ceil(totalUsers / pageSize);

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
					<CardDescription>
						Manage users, roles, and permissions. Total users: {totalUsers}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="w-full">
						<div className="flex items-center gap-4 py-4">
							<div className="relative flex-1">
								<Search className="absolute top-2.5 left-2 size-4 text-muted-foreground" />
								<Input
									placeholder={`Search by ${searchField}...`}
									value={searchValue}
									onChange={(event) => setSearchValue(event.target.value)}
									className="max-w-sm pl-8"
									disabled={isLoading}
								/>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<Filter className="mr-2 size-4" />
										Filters
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-64">
									<DropdownMenuLabel>Filter by Field</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<div className="p-2">
										<RadioGroup
											value={searchField}
											onValueChange={(value) => {
												setSearchField(value as "name" | "email");
												setPageIndex(0);
											}}
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="name" id="filter-name" />
												<Label htmlFor="filter-name" className="font-normal">
													Name
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="email" id="filter-email" />
												<Label htmlFor="filter-email" className="font-normal">
													Email
												</Label>
											</div>
										</RadioGroup>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<div className="p-2">
										<RadioGroup
											value={filterRole}
											onValueChange={(value) => {
												setFilterRole(value);
												setPageIndex(0);
											}}
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="all" id="role-all" />
												<Label htmlFor="role-all" className="font-normal">
													All Roles
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="user" id="role-user" />
												<Label htmlFor="role-user" className="font-normal">
													User
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="admin" id="role-admin" />
												<Label htmlFor="role-admin" className="font-normal">
													Admin
												</Label>
											</div>
										</RadioGroup>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										Columns <ChevronDown className="ml-2 size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{table
										.getAllColumns()
										.filter((column) => column.getCanHide())
										.map((column) => {
											return (
												<DropdownMenuCheckboxItem
													key={column.id}
													className="capitalize"
													checked={column.getIsVisible()}
													onCheckedChange={(value) =>
														column.toggleVisibility(!!value)
													}
												>
													{column.id}
												</DropdownMenuCheckboxItem>
											);
										})}
								</DropdownMenuContent>
							</DropdownMenu>
							<AddUserDialog />
						</div>

						<div className="overflow-hidden rounded-md border">
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												return (
													<TableHead key={header.id}>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center"
											>
												Loading users...
											</TableCell>
										</TableRow>
									) : isError ? (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center text-destructive"
											>
												Error loading users. Please try again.
											</TableCell>
										</TableRow>
									) : table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow
												key={row.id}
												data-state={row.getIsSelected() && "selected"}
											>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center"
											>
												No users found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						<div className="flex items-center justify-between space-x-2 py-4">
							<div className="flex-1 text-muted-foreground text-sm">
								{table.getFilteredSelectedRowModel().rows.length} of{" "}
								{totalUsers} row(s) selected.
							</div>
							<div className="flex items-center gap-2">
								<div className="text-muted-foreground text-sm">
									Page {pageIndex + 1} of {totalPages || 1}
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setPageIndex(0);
										}}
										disabled={pageIndex === 0 || isLoading}
									>
										First
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setPageIndex((old) => Math.max(0, old - 1));
										}}
										disabled={pageIndex === 0 || isLoading}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setPageIndex((old) =>
												old < totalPages - 1 ? old + 1 : old,
											);
										}}
										disabled={pageIndex >= totalPages - 1 || isLoading}
									>
										Next
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setPageIndex(totalPages - 1);
										}}
										disabled={pageIndex >= totalPages - 1 || isLoading}
									>
										Last
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
