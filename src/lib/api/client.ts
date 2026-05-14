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
      
      try {
        const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
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
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        deleteCookie(COOKIE_KEYS.TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
