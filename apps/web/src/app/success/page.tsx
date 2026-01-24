import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ checkout_id?: string }>;
}) {
	const params = await searchParams;
	const checkoutId = params.checkout_id;

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
			<div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-8 shadow-sm sm:p-10">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
						<svg
							aria-hidden="true"
							className="h-6 w-6 text-emerald-600"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								d="M20 7L9 18l-5-5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<div>
						<p className="font-medium text-muted-foreground text-sm">
							Checkout complete
						</p>
						<h1 className="font-semibold text-2xl text-foreground">
							Payment confirmed
						</h1>
					</div>
				</div>
				<p className="mt-4 text-base text-muted-foreground">
					Thanks for completing checkout. Your access is active, so you can
					return to your dashboard anytime.
				</p>
				{checkoutId && (
					<div className="mt-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Checkout ID
						</p>
						<p className="mt-1 font-mono text-foreground">{checkoutId}</p>
					</div>
				)}
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg" className="w-full sm:w-auto">
						<Link href="/dashboard">Return to dashboard</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full sm:w-auto"
					>
						<Link href="/">Back to home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
