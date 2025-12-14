import type { AxiosError } from "axios";
import { ref } from "vue";
import { api } from "../boot/axios";
import router from "../router";
import { requestNotificationPermission } from "./notifications";

export type UserStatus = "online" | "do_not_disturb" | "offline" | "idle";

export interface User {
  username: string;
  status: UserStatus;
  isOwner?: boolean;
}

export interface RegisterResponse {
  id: string;
  username: string;
  status: string;
  notificationPerm: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  username: string;
  status: string;
  notificationPerm: boolean;
  createdAt: string;
  updatedAt: string;
}

export const loggedUser = ref<User | null>(null);
export const previousStatus = ref<UserStatus | null>(null);

function initLoggedUser() {
  if (localStorage.getItem("user") != "") {
    const user: User = JSON.parse(localStorage.getItem("user")!);

    if (user?.status === "offline") {
      user.status = "online";
      localStorage.setItem("user", JSON.stringify(user));

      api.post("user/changeStatus", { status: "online" }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
        .catch((err) =>
          console.error("Failed to update status on refresh:", err)
        );
    }

    loggedUser.value = { username: user?.username, status: user?.status };
  }
}

initLoggedUser();

export async function register(
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  try {
    const response = await api.post<RegisterResponse>("/auth/register", {
      username: username,
      first_name: first_name,
      last_name: last_name,
      email: email,
      password,
      password_confirmation: passwordConfirmation,
    });

    return response.data;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Register Error message:", error.message);
    }
  }
}

export async function login(username: string, password: string) {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      username: username,
      password: password,
    });

    const { token, ...user } = response.data;
    if (token == "[redacted]") {
      console.log("ten token je proste redacted");
    }
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (!user) {
      await router.push("/login");
    }
    loggedUser.value = {
      username: response.data.username,
      status: response.data.status as UserStatus,
    };

    void requestNotificationPermission();

    await router.push("/");
    return user;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Login Error message:", error.message);
    }
  }
}

export async function logout() {
  try {
    await api.post("/auth/logout");

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    console.log("Redirecting to login...");
    await router.push("/auth/login");
  } catch (err) {
    const error = err as AxiosError;
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Logout Error message:", error.message);
    }
  }
}

export async function changeStatus(status: string) {
  try {
    const result = await api.post("user/changeStatus", { status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const oldStatus = loggedUser.value?.status;
    const newStatus = result.data.status as UserStatus;

    loggedUser.value = {
      username: loggedUser.value!.username,
      status: newStatus,
    };
    const user = JSON.parse(localStorage.getItem("user")!);
    user!.status = newStatus;
    localStorage.setItem("user", JSON.stringify(user));

    //import services dynamically to avoid circular dependencies
    const channelService = (await import("../services/ChannelService")).default;
    const privateService = (await import("../services/PrivateService")).default;

    if (newStatus === "offline") {
      channelService.disconnectAll();
      privateService.disconnect();
      console.log("Disconnected all sockets due to offline status");
    }

    if (oldStatus === "offline" && newStatus !== "offline") {
      const { loadUserGroups, changeGroup, currentGroupId, groupLinks } = await import("./groups");

      const savedGroupId = currentGroupId.value;
      channelService.clearAll();
      privateService.reconnect();

      await loadUserGroups();

      if (savedGroupId && groupLinks.value.find((g) => g.id === savedGroupId)) {
        await changeGroup(savedGroupId);
      }

      console.log("Reconnected all sockets");
    }
    previousStatus.value = newStatus;
  } catch (err) {
    const error = err as AxiosError;
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
  }
}

export function getUsernameAbbr(username: string) {
  return username[0] + username[1]!;
}
