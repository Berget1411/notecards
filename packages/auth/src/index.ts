import { env } from "cloudflare:workers";
import { db } from "@notecards/db";
import * as schema from "@notecards/db/schema/auth";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { polarClient } from "./lib/payments";

export const auth = betterAuth<BetterAuthOptions>({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
	// session: {
	//   cookieCache: {
	//     enabled: true,
	//     maxAge: 60,
	//   },
	// },
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		// uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
		// https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
		// crossSubDomainCookies: {
		//   enabled: true,
		//   domain: "<your-workers-subdomain>",
		// },
	},
	plugins: [
		admin({
			defaultRole: "user",
			adminRoles: ["admin"],
			defaultBanReason: "Banned by admin",
			bannedUserMessage: "You have been banned by an admin",
		}),
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			enableCustomerPortal: true,
			use: [
				checkout({
					products: [
						{
							productId: "5e004df1-6439-4d00-bd89-228b3a0b87b7",
							slug: "premium_monthly",
						},
						{
							productId: "829f2cd5-82ab-47bc-8d2e-004c3ee50ab7",
							slug: "premium_yearly",
						},
					],
					successUrl: env.POLAR_SUCCESS_URL,
					authenticatedUsersOnly: true,
				}),
				portal(),
				webhooks({
					secret: env.POLAR_WEBHOOK_SECRET || "",
					onSubscriptionCreated: async (payload) => {
						console.log("Subscription created:", payload);
					},
					onSubscriptionActive: async (payload) => {
						console.log("Subscription activated:", payload);
					},
					onOrderPaid: async (payload) => {
						console.log("Order paid:", payload);
					},
					onCustomerStateChanged: async (payload) => {
						console.log("Customer state changed:", payload);
					},
				}),
			],
		}),
	],
});
