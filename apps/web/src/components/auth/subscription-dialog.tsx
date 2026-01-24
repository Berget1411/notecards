"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

interface SubscriptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const features = [
	"Unlimited AI flashcards",
	"Unlimited AI summaries",
	"Unlimited AI quizzes",
];

export function SubscriptionDialog({
	open,
	onOpenChange,
}: SubscriptionDialogProps) {
	const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const [isLoading, setIsLoading] = useState(false);

	const handleUpgrade = async () => {
		try {
			setIsLoading(true);
			await authClient.checkout({
				slug: selectedPlan === "monthly" ? "premium_monthly" : "premium_yearly",
			});
		} catch (error) {
			console.error("Checkout error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const monthlyPrice = 10;
	const yearlyPrice = 37;
	const yearlyMonthlyPrice = (yearlyPrice / 12).toFixed(2);
	const savingsPercent = Math.round(
		((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogTitle>Upgrade to Premium</DialogTitle>
				<DialogDescription>
					Unlock unlimited AI study tools in minutes.
				</DialogDescription>
				<div className="mt-6 space-y-6">
					<div className="space-y-3">
						<button
							type="button"
							onClick={() => setSelectedPlan("monthly")}
							className={`w-full rounded-lg border px-4 py-3 text-left transition ${
								selectedPlan === "monthly"
									? "border-primary bg-primary/5"
									: "border-border hover:border-primary/50"
							}`}
						>
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="font-medium">Monthly</p>
									<p className="text-muted-foreground text-sm">
										${monthlyPrice} per month
									</p>
								</div>
								{selectedPlan === "monthly" ? (
									<Check className="size-4 text-primary" />
								) : null}
							</div>
						</button>
						<button
							type="button"
							onClick={() => setSelectedPlan("yearly")}
							className={`w-full rounded-lg border px-4 py-3 text-left transition ${
								selectedPlan === "yearly"
									? "border-primary bg-primary/5"
									: "border-border hover:border-primary/50"
							}`}
						>
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="font-medium">Yearly</p>
									<p className="text-muted-foreground text-sm">
										${yearlyPrice} per year · ${yearlyMonthlyPrice} / month
										{savingsPercent > 0 ? ` · Save ${savingsPercent}%` : ""}
									</p>
								</div>
								{selectedPlan === "yearly" ? (
									<Check className="size-4 text-primary" />
								) : null}
							</div>
						</button>
					</div>
					<div className="rounded-lg border bg-card p-4">
						<p className="mb-3 font-semibold text-sm">What's included</p>
						<ul className="space-y-2 text-muted-foreground text-sm">
							{features.map((feature) => (
								<li key={feature} className="flex items-center gap-2">
									<Check className="size-4 text-primary" />
									<span>{feature}</span>
								</li>
							))}
						</ul>
					</div>
					<Button
						onClick={handleUpgrade}
						disabled={isLoading}
						size="lg"
						className="w-full"
					>
						{isLoading ? "Processing..." : "Upgrade"}
					</Button>
					<p className="text-center text-muted-foreground text-xs">
						Cancel anytime. Subscriptions renew automatically.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
