"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function Stats() {
	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>Statistics</CardTitle>
					<CardDescription>
						View system statistics and analytics
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Statistics dashboard coming soon...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
