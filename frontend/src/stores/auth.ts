import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import { authManager } from "src/services";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as
      | null
      | {
        id: string;
        username: string;
      },
    loading: false,
  }),

  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
  },

  actions: {
    async check() {
      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        this.user = response.data;
        return true;
      } catch {
        this.user = null;
        return false;
      }
    },

    async login(credentials: { username: string; password: string }) {
      const response = await api.post("/auth/login", credentials);
      console.log("tu som");
      // console.log(response.data);
      // console.log(response.data.token);
      authManager.setToken(response.data.token);

      await this.check();
    },

    logout() {
      authManager.logout();
      this.user = null;
    },
  },
});
