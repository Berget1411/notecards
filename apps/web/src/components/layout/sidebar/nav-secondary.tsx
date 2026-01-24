"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { SubscriptionDialog } from "@/components/auth/subscription-dialog";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: customerState, isLoading } = useQuery({
		queryKey: ["customerState"],
		queryFn: async () => {
			const result = await authClient.customer.state();
			return result.data;
		},
	});
	const hasProSubscription =
		(customerState?.activeSubscriptions?.length ?? 0) > 0;
	const showUpgrade = !isLoading && !hasProSubscription;

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild>
								<a href={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
					{showUpgrade ? (
						<SidebarMenuItem>
							<SidebarMenuButton onClick={() => setDialogOpen(true)}>
								<ArrowUpRight />
								<span>Upgrade</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					) : null}
				</SidebarMenu>
				<SubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
