export class ApiError extends Error {
	constructor(message: string, public readonly status: number) {
		super(message);
		this.name = "ApiError";
	}
}

export const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
	const headers = new Headers(init.headers);
	if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
	const response = await fetch(path, { ...init, headers, credentials: "include" });
	const payload: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined);
	if (!response.ok) {
		const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
			? payload.message
			: "The request could not be completed. Please try again.";
		throw new ApiError(message, response.status);
	}
	return payload as T;
};
