import { AxiosInstance } from "axios";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "../constant";

export const setupInterceptors = (instance: AxiosInstance) => {
  // Request interceptor
  instance.interceptors.request.use(
    async (config) => {
      const token = getCookie(COOKIE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // await signOut({});
      }

      return Promise.reject(error);
    }
  );
};

