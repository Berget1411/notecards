import type { auth } from "@notecards/auth";
import { polarClient } from "@polar-sh/better-auth";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [inferAdditionalFields<typeof auth>(), polarClient(), adminClient()],
});
