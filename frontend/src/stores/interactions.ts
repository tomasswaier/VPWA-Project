import type { AxiosError } from "axios";
import { Notify } from "quasar";
import { reactive, ref } from "vue";

import { api } from "../boot/axios";
import type { SerializedMessage } from "../contracts/Message";
import router from "../router";
import channelService from "../services/ChannelService";

const page = ref(1);
const finished = ref(false);
const messages = ref<SerializedMessage[]>([]);
const currentGroupId = ref("");

const text = ref("");
const currentlyPeekedMessage = ref("");

const loggedUser = ref<User | null>(null);
function initLoggedUser() {
  if (localStorage.getItem("user") != "") {
    const user: User = JSON.parse(localStorage.getItem("user")!);

    loggedUser.value = { username: user?.username, status: user?.status };
  }
}
initLoggedUser();

export type UserStatus = "online" | "do_not_disturb" | "offline" | "idle";
interface User {
  username: string;
  status: UserStatus;
}
const displayedMembers = ref<User[]>([]);
const currentGroupName = ref("Trumans Group");

interface TypingUser {
  name: string;
  message: string;
}
interface RegisterResponse {
  id: string;
  username: string;
  status: string;
  notificationPerm: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  token: string;
  id: string;
  username: string;
  status: string;
  notificationPerm: boolean;
  createdAt: string;
  updatedAt: string;
}

const typingUsers = ref<TypingUser[]>([
  { name: "Johnka", message: "I have yet to introduce myself moew moew moe w" },
  {
    name: "Emanuel",
    message:
      "Ja som Emanuel Emanuel som ja a ja ak budem Emanuel tak budem Emanuel",
  },
]);

const publicGroups = ref<GroupLinkProps[]>([]);
interface GroupLinkProps {
  id?: string;
  title: string;
  caption?: string;
  link?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
}

interface Dialogs {
  groupLeave: boolean;
  groupList: boolean;
  groupCreate: boolean;
  groupDelete: boolean;
  groupInvite: boolean;
  groupUserList: boolean;
  userKick: boolean;
  userRevoke: boolean;
  userMessagePeek: boolean;
}
const dialogs: Dialogs = reactive({
  groupLeave: false,
  groupList: false,
  groupCreate: false,
  groupDelete: false,
  groupInvite: false,
  groupUserList: false,
  userKick: false,
  userRevoke: false,
  userMessagePeek: false,
});

const groupLinks = ref<GroupLinkProps[]>([]);

const baseMemberTemplates = [
  { name: "Johnka", status: "online" },
  {
    name: "Marian Emanual Chornandez Pelko De La Muerto",
    status: "do_not_disturb",
  },
  { name: "Tomas Truman", status: "offline" },
];

function loadGroupMembers(index: number, done: () => void): void {
  setTimeout(() => {
    const batchSize = 5;
    const newMembers = [];

    for (let i = 0; i < batchSize; i++) {
      const templateIX = (displayedMembers.value.length + i) %
        baseMemberTemplates.length;
      const template = baseMemberTemplates[templateIX]!;

      newMembers.push({
        username: `${template.name} #${displayedMembers.value.length + i + 1}`,
        status: template.status as UserStatus,
      });
    }

    displayedMembers.value.push(...newMembers);
    done();
  }, 300);
}

async function loadPublicGroups(
  index: number,
  done: () => void,
): Promise<void> {
  try {
    console.log("Calling API /groups...");
    const response = await api.get("/groups");
    console.log("Response:", response);
    const groups = response.data;

    publicGroups.value = groups.map((group: {
      id: string;
      name: string;
      description: string | null;
      isPrivate: boolean;
    }) => ({
      id: group.id || "",
      title: group.name,
      caption: group.description || "",
      link: "",
      isPrivate: group.isPrivate,
      isOwner: false,
    }));

    done();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Full error:", err);
    console.error("Error response:", error.response);

    Notify.create({
      message: error.response?.data?.message || "Failed to load groups",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });

    done();
  }
}

function resetGroupMembers(): void {
  displayedMembers.value = [];
}
async function changeGroup(groupId: string) {
  // Update current group
  currentGroupId.value = groupId;
  finished.value = false;
  messages.value = [];
  page.value = 1;

  try {
    // Join the new group
    const channel = channelService.join(groupId);
    await channelService.setGroup(groupId);

    // Load first page of messages
    const loadedMessages = await channel.loadMessages(page.value);
    messages.value = loadedMessages;
    page.value++;

    channel.subscribe();
    // Subscribe to new messages
  } catch (err) {
    console.error("Failed to change group:", err);
  }
}

async function loadMessages(index: number, done: () => void) {
  if (finished.value || currentGroupId.value === "") {
    done();
    return;
  }

  try {
    const res = await api.get(
      `/groups/${currentGroupId.value}/messages?page=${page.value}`,
    );

    const newMessages: SerializedMessage[] = (res.data as SerializedMessage[])
      .map(
        (msg) => ({
          id: msg.id,
          content: msg.content,
          author: msg.author,
          containsMention: false,
          groupId: msg.groupId || "",
        }),
      );

    if (!newMessages.length) {
      finished.value = true;
    } else {
      messages.value.unshift(...newMessages);
      page.value++;
    }
  } catch (err) {
    console.error("Failed to load messages", err);
    finished.value = true;
  }

  done();
}

function getUsernameAbbr(username: string) {
  return username[0] + username[1]!;
}

async function joinGroup(args: string[]) {
  if (args.length === 0) {
    Notify.create({
      message: "Usage: /join groupName [private] [description]",
      color: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  const groupName = args[0];
  let isPrivate = false;
  let description = null;

  if (args.length > 1 && args[1] === "[private]") {
    isPrivate = true;
    if (args.length > 2) {
      description = args.slice(2).join(" ");
    }
  } else {
    if (args.length > 1) {
      description = args.slice(1).join(" ");
    }
  }

  try {
    const response = await api.post(
      "/groups/join-or-create",
      { name: groupName, isPrivate: isPrivate, description: description },
    );

    Notify.create({
      message: response.data.message,
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });

    await loadUserGroups();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    Notify.create({
      message: error.response?.data?.message || "Failed to join/create group",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

async function sendMessage() {
  const inputText: string = text.value.trim();
  const allArguments: string[] = inputText.split(" ");
  if (inputText) {
    const firstArg: string = allArguments[0] as string;
    switch (firstArg) {
      case "/test":
        console.log(localStorage.getItem("user"));
        break;
      case "/quit": // to iste ako /cancel, ale bolo v zadani aj quit, cize dali
        // sme sem obe funkcie
        void cancelGroup(allArguments.slice(1));
        break;
      case "/cancel":
        void cancelGroup(allArguments.slice(1));
        break;
      case "/invite":
        inviteGroup();
        break;
      case "/list":
        listGroupUsers();
        break;
      case "/join":
        void joinGroup(allArguments.slice(1));
        break;
      case "/delete":
        deleteGroup();
        break;
      case "/revoke":
        revokeUser();
        break;
      case "/kick":
        kickUser();
        break;
      default: {
        await sendMessageAPI(inputText);
        break;
      }
    }
    text.value = "";
  }
}
async function sendMessageAPI(inputText: string) {
  const containsMention = inputText.includes("@");

  const newMessage: SerializedMessage = {
    content: inputText,
    groupId: currentGroupId.value,
    id: Date.now(),
    author: "me",
    containsMention,
  };

  messages.value.push(newMessage);
  text.value = "";

  try {
    const res = await api.post(
      `/groups/${currentGroupId.value}/messages`,
      { contents: inputText },
    );

    // Optionally update the pushed message with real ID from server
    newMessage.id = res.data.id;
    newMessage.author = res.data.user.username; // or however your backend responds
    newMessage.groupId = res.data.groupId;
  } catch (err) {
    console.error("Failed to send message", err);
    // Optionally remove the optimistic message or mark it failed
    messages.value = messages.value.filter((m) => m.id !== newMessage.id);
  }
}

async function register(
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

async function login(
  username: string,
  password: string,
) {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      username: username,
      password: password,
    });

    const { token, ...user } = response.data;
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (!user) {
      await router.push("/login");
    }
    loggedUser.value = {
      username: response.data.username,
      status: response.data.status as UserStatus,
    };

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
async function logout() {
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
async function changeStatus(status: string) {
  try {
    const result = await api.post("user/changeStatus", { status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    loggedUser.value = {
      username: loggedUser.value!.username,
      status: result.data.status as UserStatus,
    };
    const user = JSON.parse(localStorage.getItem("user")!);
    user!.status = result.data.status as UserStatus;

    localStorage.setItem("user", JSON.stringify(user));
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

function listGroupUsers() {
  resetGroupMembers();
  dialogs.groupUserList = true;
}

function listGroups() {
  dialogs.groupList = true;
}

function openCreateGroupDialog() {
  dialogs.groupCreate = true;
}

function leaveGroup(groupId: string) {
  console.log(groupId);
  dialogs.groupLeave = true;
}

function deleteGroup() {
  dialogs.groupDelete = true;
}

function inviteGroup() {
  dialogs.groupInvite = true;
}

function openDialog(user: TypingUser) {
  currentlyPeekedMessage.value = user.message;
  dialogs.userMessagePeek = true;
}

function kickUser() {
  dialogs.userKick = true;
}

function revokeUser() {
  dialogs.userRevoke = true;
}

function simulateIncomingInvite(userName: string, groupName: string) {
  Notify.create({
    message: `${userName} has invited you to ${groupName}`,
    color: "primary",
    icon: "group_add",
    position: "top-right",
    timeout: 5000,
    actions: [
      {
        label: "Accept",
        color: "white",
        handler: () => {
          Notify.create({
            message: `You joined ${groupName}!`,
            color: "positive",
            icon: "check_circle",
            position: "top",
            timeout: 2000,
          });
        },
      },
      {
        label: "Decline",
        color: "white",
        handler: () => {
          Notify.create({
            message: "Invitation declined",
            color: "red",
            icon: "cancel",
            position: "top",
            timeout: 2000,
          });
        },
      },
    ],
  });
}

async function joinPublicGroup(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/join`);

    Notify.create({
      message: response.data.message || "Successfully joined the group!",
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });

    await loadUserGroups();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error joining group:", error);

    Notify.create({
      message: error.response?.data?.message || "Failed to join group",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

async function leaveGroupAPI(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/leave`);

    Notify.create({
      message: response.data.message || "Successfully left the group",
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });

    await loadUserGroups();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error leaving group:", error);

    Notify.create({
      message: error.response?.data?.message || "Failed to leave group",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

async function loadGroupMembersAPI(groupId: string): Promise<void> {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    const members = response.data;

    displayedMembers.value = members.map((
      member: { username: string; status: UserStatus },
    ) => ({
      name: member.username,
      status: member.status,
    }));
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error loading members:", error);

    Notify.create({
      message: error.response?.data?.message || "Failed to load group members",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

async function loadUserGroups(): Promise<void> {
  try {
    const response = await api.get("/auth/me");
    const user = response.data;

    if (user.groups) {
      groupLinks.value = user.groups.map(
        (group: {
          id: string;
          name: string;
          description: string | null;
          isPrivate: boolean;
          is_private: boolean;
        }) => ({
          id: group.id,
          title: group.name,
          caption: group.description || "",
          link: "",
          isPrivate: group.isPrivate || group.is_private,
          isOwner: false,
        }),
      );
      if (groupLinks.value[0] && groupLinks.value[0].id) {
        await changeGroup(groupLinks.value[0].id);
      }
    }
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error loading user groups:", error);
  }
}

async function cancelGroup(args: string[]) {
  if (args.length === 0) {
    Notify.create({
      message: "Usage: /cancel or /quit groupName",
      color: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  const groupName = args[0];

  // skupina podľa názvu v "groupLinks"
  const group = groupLinks.value.find((g) => g.title === groupName);

  if (!group || !group.id) {
    Notify.create({
      message: `Group "${groupName}" not found`,
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {
    const response = await api.post(`/groups/${group.id}/leave`);

    Notify.create({
      message: response.data.message,
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });

    await loadUserGroups();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    Notify.create({
      message: error.response?.data?.message || "Failed to leave group",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

export type { Dialogs, GroupLinkProps, TypingUser, User };

export {
  cancelGroup,
  changeGroup,
  changeStatus,
  currentGroupId,
  currentGroupName,
  currentlyPeekedMessage,
  deleteGroup,
  dialogs,
  displayedMembers,
  getUsernameAbbr,
  groupLinks,
  inviteGroup,
  joinGroup,
  joinPublicGroup,
  leaveGroup,
  leaveGroupAPI,
  listGroups,
  loadGroupMembers,
  loadGroupMembersAPI,
  loadMessages,
  loadPublicGroups,
  loadUserGroups,
  loggedUser,
  login,
  logout,
  messages,
  openCreateGroupDialog,
  openDialog,
  publicGroups,
  register,
  resetGroupMembers,
  sendMessage,
  simulateIncomingInvite,
  text,
  typingUsers,
};
