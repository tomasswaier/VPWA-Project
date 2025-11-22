import axios from "axios";
import type { AxiosInstance } from "axios";
import { boot } from "quasar/wrappers";
import { authManager } from "src/services";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create(
  {
    baseURL: process.env.API_URL || "http://localhost:3333",
    headers: {},
  },
);

const DEBUG = process.env.NODE_ENV === "development";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.info("<- ", response);
    }

    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error("<- ", error.response);
    }

    // server api request returned unathorized response so logout
    if (
      error.response.status === 401 &&
      !error.response.config.dontTriggerLogout
    ) {
      authManager.logout();
    }

    return Promise.reject(new Error("Axios Error 2"));
  },
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
