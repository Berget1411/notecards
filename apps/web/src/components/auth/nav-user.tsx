"use client";
import {
	IconDotsVertical,
	IconLogout,
	IconMoon,
	IconSettings,
	IconSun,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SettingsDialog } from "@/components/auth/settings-dialog/settings-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function NavUser() {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { theme, setTheme } = useTheme();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	// Only show content after client-side hydration to avoid mismatch
	useEffect(() => {
		setIsClient(true);
	}, []);
	const handleThemeToggle = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	// Don't render content until client-side hydration is complete
	// This prevents hydration mismatch since session is already loaded server-side
	if (!isClient) {
		return (
			<>
				<SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg">CN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">Loading...</span>
								<span className="truncate text-muted-foreground text-xs">
									Loading...
								</span>
							</div>
							<IconDotsVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</>
		);
	}

	return (
		<>
			<SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={session?.user.image ?? undefined}
										alt={session?.user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{session?.user.name?.charAt(0) ?? "CN"}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{session?.user.name}
									</span>
									<span className="truncate text-muted-foreground text-xs">
										{session?.user.email}
									</span>
								</div>
								<IconDotsVertical className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={session?.user.image ?? undefined}
											alt={session?.user.name}
										/>
										<AvatarFallback className="rounded-lg">
											{session?.user.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{session?.user.name}
										</span>
										<span className="truncate text-muted-foreground text-xs">
											{session?.user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem asChild onClick={() => setSettingsOpen(true)}>
									<div>
										<IconSettings />
										Settings
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleThemeToggle}>
									{theme === "light" ? <IconMoon /> : <IconSun />}
									{theme === "light" ? "Dark Mode" : "Light Mode"}
								</DropdownMenuItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									authClient.signOut({
										fetchOptions: {
											onSuccess: () => {
												router.push("/sign-in");
											},
										},
									});
								}}
							>
								<IconLogout />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</>
	);
}
