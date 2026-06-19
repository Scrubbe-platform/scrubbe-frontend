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
    // Get token dynamically for each request
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Handle 401 errors - Token expired or invalid
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        deleteCookie(COOKIE_KEYS.TOKEN);
        redirectToSignIn();
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data?.data ?? {};

        if (accessToken && newRefreshToken) {
          setCookie(COOKIE_KEYS.TOKEN, accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }

        // Refresh endpoint responded but without usable tokens — treat as expired session.
        deleteCookie(COOKIE_KEYS.TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
        redirectToSignIn();
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        deleteCookie(COOKIE_KEYS.TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
        redirectToSignIn();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
