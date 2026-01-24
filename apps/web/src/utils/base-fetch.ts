import { env } from "@notecards/env/web";

type BodyPayload = BodyInit | Record<string, unknown> | null | undefined;

export type BaseFetchOptions = Omit<RequestInit, "body"> & {
	body?: BodyPayload;
};

const isJsonBody = (body: BodyPayload): body is Record<string, unknown> => {
	return (
		!!body &&
		typeof body === "object" &&
		!(body instanceof FormData) &&
		!(body instanceof Blob) &&
		!(body instanceof ArrayBuffer) &&
		!(body instanceof URLSearchParams)
	);
};

const buildUrl = (path: string) => {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	const baseUrl = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${baseUrl}${normalized}`;
};

const getErrorMessage = async (response: Response) => {
	const fallback = response.statusText || "Request failed";
	const data = await response.json().catch(() => null);
	if (data && typeof data === "object") {
		if ("error" in data && typeof data.error === "string") {
			return data.error;
		}
		if ("message" in data && typeof data.message === "string") {
			return data.message;
		}
	}
	return fallback;
};

export async function baseFetch(path: string, options: BaseFetchOptions = {}) {
	const { body, headers, ...rest } = options;
	const resolvedHeaders = new Headers(headers);
	let resolvedBody: BodyInit | null | undefined = body as
		| BodyInit
		| null
		| undefined;

	if (isJsonBody(body)) {
		resolvedHeaders.set("Content-Type", "application/json");
		resolvedBody = JSON.stringify(body);
	}

	const response = await fetch(buildUrl(path), {
		...rest,
		body: resolvedBody,
		headers: resolvedHeaders,
		credentials: rest.credentials ?? "include",
	});

	if (!response.ok) {
		throw new Error(await getErrorMessage(response));
	}

	return response;
}

export async function baseFetchJson<T>(
	path: string,
	options: BaseFetchOptions = {},
) {
	const response = await baseFetch(path, options);
	return (await response.json()) as T;
}
