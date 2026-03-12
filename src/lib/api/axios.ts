import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
import { COOKIE_KEYS } from "../constant";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

axios.interceptors.request.use(
  (config) => {
    const token = getCookie(COOKIE_KEYS.TOKEN);
    if (token !== undefined) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie(COOKIE_KEYS.TOKEN);
      deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
    }
    return Promise.reject(error);
  }
);

export { axios as customAxios };
