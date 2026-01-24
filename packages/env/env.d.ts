// This file defines types for the Cloudflare Workers environment bindings.
export interface CloudflareEnv {
	DATABASE_URL: string;
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	OPENAI_API_KEY: string;
	POLAR_ACCESS_TOKEN: string;
	POLAR_SUCCESS_URL: string;
	POLAR_WEBHOOK_SECRET: string;
	R2_DECK_PDFS: R2Bucket;
}

declare global {
	type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
	namespace Cloudflare {
		export interface Env extends CloudflareEnv {}
	}
}
