"use client";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

type CustomerState = Awaited<
	ReturnType<typeof authClient.customer.state>
>["data"];
type Session = Awaited<ReturnType<typeof authClient.getSession>>;

export default function Dashboard({
	customerState,
	session,
}: {
	customerState: CustomerState | null;
	session: Session;
}) {
	const privateData = useQuery(trpc.privateData.queryOptions());

	const hasProSubscription =
		(customerState?.activeSubscriptions?.length ?? 0) > 0;
	console.log("Active subscriptions:", customerState?.activeSubscriptions);

	return (
		<>
			<p>API: {privateData.data?.message}</p>
			<p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
			<p>Name: {session.user.name}</p>
			{hasProSubscription ? (
				<Button onClick={async () => await authClient.customer.portal()}>
					Manage Subscription
				</Button>
			) : (
				<Button
					onClick={async () => await authClient.checkout({ slug: "pro" })}
				>
					Upgrade to Pro
				</Button>
			)}
		</>
	);
}
