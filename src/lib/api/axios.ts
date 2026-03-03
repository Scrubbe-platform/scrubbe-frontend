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

    // Disable credentials to avoid CORS issues
    // TEMP: This should be removed in production
    config.withCredentials = false;

    return config;
  },
  async (error) => {
    // Check for a 401 status code
    if (error.response && error.response.status === 401) {
      // Call the passed-in function
      console.log("This is 404 error");
      deleteCookie(COOKIE_KEYS.TOKEN);
      deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
    }
    return Promise.reject(error);
  }
);

export { axios as customAxios };
