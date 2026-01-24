"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	CreditCard,
	DollarSign,
	Loader2,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { SubscriptionDialog } from "../subscription-dialog";

export function SubscriptionTab() {
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
	const activeSubscription = customerState?.activeSubscriptions?.[0];

	// Check if subscription will expire (canceled or set to cancel at period end)
	const isCanceled =
		activeSubscription?.status &&
		["canceled", "cancelled"].includes(activeSubscription.status);
	const cancelAtPeriodEnd = activeSubscription?.cancelAtPeriodEnd ?? false;
	const willExpire = isCanceled || cancelAtPeriodEnd;

	const handleUpgrade = () => {
		setDialogOpen(true);
	};

	const handleManageSubscription = async () => {
		try {
			await authClient.customer.portal();
		} catch (error) {
			console.error("Portal error:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold text-lg">Subscription & Billing</h3>
				<p className="text-muted-foreground text-sm">
					Manage your subscription and billing information
				</p>
			</div>

			<Separator />

			{/* Cancellation Warning */}
			{hasProSubscription &&
				willExpire &&
				activeSubscription?.currentPeriodEnd && (
					<Alert variant="destructive">
						<AlertCircle className="size-4" />
						<AlertTitle>
							Subscription {isCanceled ? "Canceled" : "Ending"}
						</AlertTitle>
						<AlertDescription>
							Your premium access will end on{" "}
							{new Date(
								activeSubscription.currentPeriodEnd,
							).toLocaleDateString()}
							. You can reactivate your subscription in the customer portal.
						</AlertDescription>
					</Alert>
				)}

			{/* Current Plan */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>Current Plan</span>
						<Badge
							variant={
								hasProSubscription
									? willExpire
										? "secondary"
										: "default"
									: "secondary"
							}
						>
							{hasProSubscription ? "Premium" : "Free"}
							{willExpire && " (Ending)"}
						</Badge>
					</CardTitle>
					<CardDescription>
						{hasProSubscription
							? willExpire && activeSubscription?.currentPeriodEnd
								? `Access until ${new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}`
								: "You have access to all premium features"
							: "Upgrade to unlock premium features"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{hasProSubscription ? (
						<div className="space-y-3">
							{activeSubscription && (
								<>
									<div className="flex items-center gap-2 text-sm">
										<DollarSign className="size-4 text-muted-foreground" />
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-medium">
											${(activeSubscription.amount / 100).toFixed(2)}
											{willExpire && " (final charge)"}
										</span>
									</div>
									{activeSubscription.currentPeriodEnd && (
										<div className="flex items-center gap-2 text-sm">
											<Calendar className="size-4 text-muted-foreground" />
											<span className="text-muted-foreground">
												{willExpire ? "Access Until:" : "Renewal Date:"}
											</span>
											<span className="font-medium">
												{new Date(
													activeSubscription.currentPeriodEnd,
												).toLocaleDateString()}
											</span>
										</div>
									)}
									<div className="flex items-center gap-2 text-sm">
										<CreditCard className="size-4 text-muted-foreground" />
										<span className="text-muted-foreground">Status:</span>
										<Badge
											variant={
												isCanceled
													? "destructive"
													: cancelAtPeriodEnd
														? "secondary"
														: "outline"
											}
											className="capitalize"
										>
											{isCanceled
												? "Canceled"
												: cancelAtPeriodEnd
													? "Ending"
													: activeSubscription.status}
										</Badge>
									</div>
								</>
							)}
							<Button
								onClick={handleManageSubscription}
								className="w-full"
								variant="outline"
							>
								{willExpire ? "Reactivate plan" : "Manage plan"}
							</Button>
						</div>
					) : (
						<div className="space-y-3">
							<div className="rounded-lg border bg-muted/50 p-4">
								<h4 className="mb-2 font-medium text-sm">Premium Features</h4>
								<ul className="space-y-1 text-muted-foreground text-sm">
									<li>• Unlimited decks</li>
									<li>• AI-powered flashcard generation</li>
									<li>• Advanced spaced repetition</li>
									<li>• Priority support</li>
									<li>• Export & backup options</li>
								</ul>
							</div>
							<Button onClick={handleUpgrade} className="w-full">
								Upgrade to Premium
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Benefits */}
			{customerState?.grantedBenefits &&
				customerState.grantedBenefits.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Active Benefits</CardTitle>
							<CardDescription>
								Benefits you have access to with your subscription
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{customerState.grantedBenefits.map((grant) => (
									<div
										key={grant.id}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="font-medium text-sm">
												Benefit #{grant.benefitId}
											</p>
											<p className="text-muted-foreground text-xs">
												Granted:{" "}
												{new Date(grant.grantedAt).toLocaleDateString()}
											</p>
										</div>
										<Badge variant="secondary">Active</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

			{/* Customer Information */}
			{customerState?.id && (
				<Card>
					<CardHeader>
						<CardTitle>Billing Information</CardTitle>
						<CardDescription>Your customer details with Polar</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Email:</span>
							<span className="font-medium">{customerState.email}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Customer ID:</span>
							<span className="font-mono text-xs">{customerState.id}</span>
						</div>
					</CardContent>
				</Card>
			)}

			<SubscriptionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</div>
	);
}
