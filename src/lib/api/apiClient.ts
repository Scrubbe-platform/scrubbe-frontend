import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "../constant";

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin-rul9.onrender.com/api/v1",
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// Error types for better handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message = "Network error occurred") {
    super(message, 0, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", data?: any) {
    super(message, 400, "VALIDATION_ERROR", data);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get fresh token for each request
    const token = getCookie(COOKIE_KEYS.TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.headers["X-Request-Time"] = new Date().toISOString();

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(new NetworkError());
    }

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          // No refresh token, clear auth and reject
          deleteCookie(COOKIE_KEYS.TOKEN);
          deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
          return Promise.reject(new AuthenticationError("Session expired. Please login again."));
        }

        // Attempt to refresh token
        const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update cookies
        setCookie(COOKIE_KEYS.TOKEN, accessToken);
        if (newRefreshToken) {
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, clear auth
        deleteCookie(COOKIE_KEYS.TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
        return Promise.reject(new AuthenticationError("Session expired. Please login again."));
      }
    }

    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || data?.error || "An error occurred";

      switch (status) {
        case 400:
          return Promise.reject(new ValidationError(message, data));
        case 401:
          return Promise.reject(new AuthenticationError(message));
        case 403:
          return Promise.reject(new AuthorizationError(message));
        case 404:
          return Promise.reject(new NotFoundError(message));
        case 429:
          return Promise.reject(new ApiError("Too many requests. Please try again later.", 429, "RATE_LIMIT"));
        case 500:
        case 502:
        case 503:
        case 504:
          return Promise.reject(new ApiError("Server error. Please try again later.", status, "SERVER_ERROR"));
        default:
          return Promise.reject(new ApiError(message, status, "UNKNOWN_ERROR", data));
      }
    }

    // Network errors
    if (error.request) {
      return Promise.reject(new NetworkError("Unable to connect to server. Please check your internet connection."));
    }

    return Promise.reject(error);
  }
);

// Retry wrapper for requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  retries = API_CONFIG.retries,
  delay = API_CONFIG.retryDelay
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) throw error;

    // Don't retry authentication errors
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      throw error;
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry with exponential backoff
    return retryRequest(requestFn, retries - 1, delay * 2);
  }
}

// Request helper with retry
export async function apiRequest<T>(
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return retryRequest(async () => {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  });
}

// Export configured axios instance
export default apiClient;

// Export types
export type { AxiosError, AxiosResponse, AxiosRequestConfig };
