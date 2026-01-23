"use client";

import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SocialLogin() {
	const handleGoogleLogin = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: `${window.location.origin}/dashboard`,
			},
			{
				onSuccess: () => {
					toast.success("Sign in with Google successful");
				},
				onError: (error) => {
					toast.error(error.error.message || error.error.statusText);
				},
			},
		);
	};

	return (
		<div className="mb-6 grid gap-6">
			<div className="flex flex-col gap-4">
				<Button
					variant="outline"
					className="w-full"
					onClick={handleGoogleLogin}
				>
					<Chrome />
					Login with Google
				</Button>
			</div>
		</div>
	);
}
