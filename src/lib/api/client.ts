import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "../constant";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL environment variable");
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to dynamically add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie(COOKIE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Paths that must never trigger a redirect-to-signin loop on 401.
const AUTH_PATH_PREFIXES = ["/auth/", "/community"];

function isOnAuthPage(): boolean {
  if (typeof window === "undefined") return true;
  return AUTH_PATH_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
}

function redirectToSignIn() {
  if (typeof window === "undefined" || isOnAuthPage()) return;
  const callbackUrl = window.location.pathname + window.location.search;
  window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

// Global state variables to handle queueing and locks
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Handle 401 errors - Token expired or invalid
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        deleteCookie(COOKIE_KEYS.TOKEN);
        redirectToSignIn();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token using a clean, isolated Axios instance
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data?.data ?? {};

        if (accessToken && newRefreshToken) {
          // Update cookies (using secure/path defaults)
          setCookie(COOKIE_KEYS.TOKEN, accessToken, { path: "/" });
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken, { path: "/" });

          // Update the original failed request header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Resolve all other queued requests with the fresh token
          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        }

        // Refresh endpoint responded but without usable tokens — treat as expired session.
        throw new Error("Invalid token payload received from refresh endpoint.");
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clean up store and cookies
        deleteCookie(COOKIE_KEYS.TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);

        // Fail any pending queued items
        processQueue(refreshError, null);
        isRefreshing = false;

        redirectToSignIn();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;