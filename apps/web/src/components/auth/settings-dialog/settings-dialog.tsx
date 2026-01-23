"use client";

import { CreditCard, Globe, Paintbrush, User } from "lucide-react";
import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { AccountTab } from "./account-tab";
import { AppearanceTab } from "./appearance-tab";
import { LanguageTab } from "./language-tab";
import { SubscriptionTab } from "./subscription-tab";

const data = {
	nav: [
		{ name: "Account", key: "account", icon: User },
		{ name: "Subscription & Billing", key: "subscription", icon: CreditCard },
		{ name: "Languages", key: "languages", icon: Globe },
		{ name: "Appearance", key: "appearance", icon: Paintbrush },
	],
};

export function SettingsDialog({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [activeTab, setActiveTab] = useState("account");

	const renderContent = () => {
		switch (activeTab) {
			case "account":
				return <AccountTab />;
			case "subscription":
				return <SubscriptionTab />;
			case "languages":
				return <LanguageTab />;
			case "appearance":
				return <AppearanceTab />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
				<DialogTitle className="sr-only">Settings</DialogTitle>
				<DialogDescription className="sr-only">
					Customize your settings here.
				</DialogDescription>
				<SidebarProvider className="items-start">
					<Sidebar collapsible="none" className="hidden md:flex">
						<SidebarContent>
							<SidebarGroup>
								<SidebarGroupContent>
									<SidebarMenu>
										{data.nav.map((item) => (
											<SidebarMenuItem key={item.name}>
												<SidebarMenuButton
													asChild
													isActive={item.key === activeTab}
													onClick={() => setActiveTab(item.key)}
												>
													<div>
														<item.icon />
														<span>{item.name}</span>
													</div>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						</SidebarContent>
					</Sidebar>
					<main className="flex h-[480px] flex-1 flex-col overflow-hidden">
						<div className="p-4">{renderContent()}</div>
					</main>
				</SidebarProvider>
			</DialogContent>
		</Dialog>
	);
}
