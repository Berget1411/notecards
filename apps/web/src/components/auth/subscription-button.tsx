"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SubscriptionDialog } from "./subscription-dialog";

interface SubscriptionButtonProps {
	variant?: "default" | "sidebar";
	className?: string;
}

export function SubscriptionButton({
	variant = "default",
	className,
}: SubscriptionButtonProps) {
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

	const handleUpgrade = () => {
		setDialogOpen(true);
	};

	const handleManage = async () => {
		try {
			await authClient.customer.portal();
		} catch (error) {
			console.error("Portal error:", error);
		}
	};

	if (isLoading) {
		return null;
	}

	if (hasProSubscription) {
		if (variant === "sidebar") {
			return null; // Don't show the upgrade button in sidebar if user has premium
		}
		return (
			<Button onClick={handleManage} className={className}>
				Manage
			</Button>
		);
	}

	if (variant === "sidebar") {
		return (
			<>
				<Button onClick={handleUpgrade} className={className}>
					Upgrade
				</Button>
				<SubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			</>
		);
	}

	return (
		<>
			<Button onClick={handleUpgrade} className={className}>
				Upgrade
			</Button>
			<SubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</>
	);
}
