import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});

	// Layout handles redirect, so session is guaranteed here
	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.data?.user?.name}</p>
			<Dashboard session={session} />
		</div>
	);
}
