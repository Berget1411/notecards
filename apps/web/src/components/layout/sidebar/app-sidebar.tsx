"use client";
import { Calendar, File, Home, Pen, Settings, Trash } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { useState } from "react";
import { NavUser } from "@/components/auth/nav-user";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavSecondary } from "@/components/layout/sidebar/nav-secondary";
import { NavWorkspaces } from "@/components/layout/sidebar/nav-workspaces";
import { Kbd } from "@/components/ui/kbd";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Home",
			url: "#",
			icon: Home,
		},
		{
			title: "Ask AI",
			url: "#",
			icon: File,
		},
		{
			title: "Calendar",
			url: "#",
			icon: Calendar,
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: Settings,
		},
		{
			title: "Trash",
			url: "#",
			icon: Trash,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { toggleSidebar } = useSidebar();
	const [openWorkspaceId, setOpenWorkspaceId] = useState<number | null>(null);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg">
							<Link href="/">
								<div className="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-primary-foreground">
									<Pen className="size-4 text-white" />
								</div>
								<span className="font-semibold text-base group-data-[collapsible=icon]:hidden">
									Notecards
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavWorkspaces
					pinned
					openWorkspaceId={openWorkspaceId}
					setOpenWorkspaceId={setOpenWorkspaceId}
				/>
				<NavWorkspaces
					openWorkspaceId={openWorkspaceId}
					setOpenWorkspaceId={setOpenWorkspaceId}
				/>
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
