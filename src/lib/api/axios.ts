import { apiClient } from "./client";

// Keep the legacy import path wired to the refreshed auth-aware client.
const customAxios = apiClient;

export { customAxios };
