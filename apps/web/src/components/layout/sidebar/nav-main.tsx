import { IconCirclePlusFilled, IconShield } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, ChevronRight, FileUp, Search, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
	}[];
}) {
	const { data: session, isPending } = authClient.useSession();
	const isAdmin = session?.user?.role === "admin";
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							tooltip="Quick Create"
							className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
						>
							<IconCirclePlusFilled />
							<span>Quick Create</span>
						</SidebarMenuButton>
						<Button
							size="icon"
							className="size-8 group-data-[collapsible=icon]:opacity-0"
							variant="outline"
						>
							<FileUp />
							<span className="sr-only">Import</span>
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip="Search (⌘K)">
							<Search />
							<span>Search</span>
							<Kbd className="ml-auto">⌘K</Kbd>
						</SidebarMenuButton>
					</SidebarMenuItem>

					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton tooltip={item.title}>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
					{isAdmin && !isPending && (
						<Collapsible>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip="Admin" asChild>
									<Link href="/dashboard/admin">
										<IconShield />
										<span>Admin</span>
									</Link>
								</SidebarMenuButton>
								<CollapsibleTrigger asChild>
									<SidebarMenuAction
										className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
										showOnHover
									>
										<ChevronRight />
									</SidebarMenuAction>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<Link href="/dashboard/admin/users">
													<Users />
													<span>User Management</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<Link href="/dashboard/admin/stats">
													<BarChart3 />
													<span>Stats</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					)}
					{isPending && (
						<SidebarMenuItem>
							<SidebarMenuButton>
								<Skeleton className="size-4 rounded-sm" />
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
