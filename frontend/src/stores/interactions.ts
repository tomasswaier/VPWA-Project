import type { AxiosError } from "axios";
import { Notify} from "quasar";
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

const notificationsEnabled = ref(true);
const mentionOnlyNotifications = ref(false);

const currentGroupIsPrivate = ref(false);
const currentGroupIsOwner = ref(false);

export interface PaginatedMessages {
  data: SerializedMessage[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    [k: string]: unknown;
  };
}

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
const currentGroupName = ref("");

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
  { name: "Emanuel", message: "Ja som Emanuel Emanuel som ja a ja ak budem Emanuel tak budem Emanuel" },
]);

const publicGroups = ref<GroupLinkProps[]>([]);
const invitations = ref<GroupLinkProps[]>([]);

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
  groupListPublic: boolean;
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
  groupListPublic: false,
  groupCreate: false,
  groupDelete: false,
  groupInvite: false,
  groupUserList: false,
  userKick: false,
  userRevoke: false,
  userMessagePeek: false,
});

const groupLinks = ref<GroupLinkProps[]>([]);

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

function showNativeNotification(title: string, body: string, onClick?: () => void) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body: body,
    icon: "/favicon.ico",
    tag: "chat-notification",
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  setTimeout(() => notification.close(), 5000);
}

function shouldShowNotification(message: SerializedMessage, appVisible: boolean): boolean {
  if (!notificationsEnabled.value) return false;
  if (appVisible) return false;
  if (loggedUser.value?.status === "do_not_disturb") return false;
  if (message.author === loggedUser.value?.username) return false;
  if (loggedUser.value?.status === "idle" && !message.containsMention) return false;
  if (mentionOnlyNotifications.value && !message.containsMention) return false;
  return true;
}

function handleIncomingMessage(message: SerializedMessage, appVisible: boolean) {
  console.log("handleIncomingMessage called", {
    message,
    appVisible,
    status: loggedUser.value?.status,
    notificationsEnabled: notificationsEnabled.value,
    shouldShow: shouldShowNotification(message, appVisible)
  });

  if (shouldShowNotification(message, appVisible)) {
    const bodyPreview = message.content.length > 50 
      ? message.content.substring(0, 50) + "..." 
      : message.content;
    showNativeNotification(
      `${message.author}`,
      bodyPreview,
      () => {
        if (message.groupId && message.groupId !== currentGroupId.value) {
          void changeGroup(message.groupId);
        }
      }
    );
  }
}

function setNotificationsEnabled(enabled: boolean) {
  notificationsEnabled.value = enabled;
  if (enabled) {
    void requestNotificationPermission();
  }
}

function setMentionOnlyNotifications(enabled: boolean) {
  mentionOnlyNotifications.value = enabled;
}

async function loadGroupMembers(index: number, done: () => void): Promise<void> {
  if (!currentGroupId.value) {
    done();
    return;
  }

  try {
    const response = await api.get(`/groups/${currentGroupId.value}/members`);
    const members = response.data;

    displayedMembers.value = members.map((member: { username: string; status: UserStatus }) => ({
      username: member.username,
      status: member.status,
    }));

    done();
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
    done();
  }
}

async function loadPublicGroups(index: number, done: () => void): Promise<void> {
  try {
    const response = await api.get("/groups");
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

async function loadInvitations(index: number, done: () => void): Promise<void> {
  try {
    const response = await api.get("/groups/invitations");
    const invites = response.data;

    invitations.value = invites.map((invite: {
      id: string;
      name: string;
      description: string | null;
      isPrivate: boolean;
    }) => ({
      id: invite.id || "",
      title: invite.name,
      caption: invite.description || "",
      link: "",
      isPrivate: invite.isPrivate,
      isOwner: false,
    }));

    done();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Full error:", err);

    Notify.create({
      message: error.response?.data?.message || "Failed to load invitations",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });

    done();
  }
}

async function acceptInvitation(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/accept-invitation`);

    Notify.create({
      message: response.data.message || "Invitation accepted!",
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });

    await loadUserGroups();
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error accepting invitation:", error);

    Notify.create({
      message: error.response?.data?.message || "Failed to accept invitation",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

//kick pre private skupiny
async function revokeUserPrivate(username: string) {
  if (!currentGroupId.value) {
    Notify.create({
      message: "No group selected",
      color: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  if (!currentGroupIsPrivate.value) {
    Notify.create({
      message: "/revoke can only be used in private groups",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  if (!currentGroupIsOwner.value) {
    Notify.create({
      message: "Only the group owner can remove users from private groups",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {
    const response = await api.post(`/groups/${currentGroupId.value}/revoke`, {
      username: username,
    });

    Notify.create({
      message: response.data.message || `${username} removed from group`,
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    Notify.create({
      message: error.response?.data?.message || "Failed to remove user",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

//kick v public groupe (3 ludia aspon)
async function kickUserByName(username: string) {
  if (!currentGroupId.value) {
    Notify.create({
      message: "No group selected",
      color: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  if (currentGroupIsPrivate.value) {
    Notify.create({
      message: "/kick cannot be used in private groups. Use /revoke instead.",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {
    const channel = channelService.join(currentGroupId.value);
    const result = await channel.voteKick(username);

    Notify.create({
      message: result.message || "Vote registered",
      color: "positive",
      position: "top",
      timeout: 2000,
    });
  } catch (err) {
    Notify.create({
      message: (err as Error).message || "Failed to vote kick",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
  }
}


async function declineInvitation(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/decline-invitation`);

    Notify.create({
      message: response.data.message || "Invitation declined",
      color: "info",
      icon: "cancel",
      position: "top",
      timeout: 2000,
    });
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Error declining invitation:", error);

    Notify.create({
      message: error.response?.data?.message || "Failed to decline invitation",
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
}

function resetGroupMembers(): void {
  displayedMembers.value = [];
}

async function changeGroup(groupId: string) {
  currentGroupId.value = groupId;
  finished.value = false;
  messages.value = [];
  page.value = 1;

  const group = groupLinks.value.find(g => g.id === groupId);
  currentGroupName.value = group?.title || "";
  currentGroupIsPrivate.value = group?.isPrivate || false;
  currentGroupIsOwner.value = group?.isOwner || false;

  try {
    const channel = channelService.join(groupId);
    await channelService.setGroup(groupId);
    const loadedMessages: PaginatedMessages = await channel.loadMessages(page.value);
    messages.value = loadedMessages.data;
    page.value++;

    channel.subscribe();
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
    const res = await api.get(`/groups/${currentGroupId.value}/messages?page=${page.value}`);

    const newMessages: SerializedMessage[] = (res.data as SerializedMessage[]).map((msg) => ({
      id: msg.id,
      content: msg.content,
      author: msg.author,
      containsMention: msg.containsMention,
      groupId: msg.groupId || "",
    }));

    if (!newMessages.length) {
      finished.value = true;
    } else {
      messages.value.unshift(...newMessages.reverse());
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
    const response = await api.post("/groups/join-or-create", {
      name: groupName,
      isPrivate: isPrivate,
      description: description,
    });

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

function checkMessageCommandParams(input: string[], expectedCount: number): boolean {
  if (input.length < expectedCount) {
    console.log("too few parameters. User /help to show all commands");
    return false;
  } else if (input.length > expectedCount) {
    console.log("too many parameters. User /help to show all commands");
  }
  return true;
}

async function sendMessage() {
  const inputText: string = text.value.trim();
  const allArguments: string[] = inputText.split(" ");
  if (inputText) {
    const firstArg: string = allArguments[0] as string;
    switch (firstArg) {
      case "/test":
        console.log(messages);
        break;
      case "/help":
        messages.value.push(
          { content: `Available commads`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/cancel = leave group (also deletes group if you're the creator)`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/list = lists all public groups`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/join [groupName] "[private]" [group description] = join public group with this groupName, join private group with groupName or create group by groupName. if argument [private] is present the created group will be private. All text unrecognized text will be treated as group description`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/delete = delete the current group if you are the owner`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/revoke [userName] = group creator may use this to revoke ban of a user.`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/kick [userName] = casts a vote to kick user userName out of this group. If three people cast this vote the person will be kicked out.`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/notifications on|off = enable or disable notifications`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
          { content: `/mentions on|off = receive notifications only for mentions`, groupId: currentGroupId.value, id: 0, author: "", containsMention: false },
        );
        break;
      case "/quit":
        void cancelGroup(allArguments.slice(1));
        break;
      case "/cancel":
        void cancelGroup(allArguments.slice(1));
        break;
      case "/invite":
        if (checkMessageCommandParams(allArguments, 2)) {
          void inviteToGroup(allArguments.slice(1));
        }
        break;
      case "/list":
        if (checkMessageCommandParams(allArguments, 1)) {
          listGroupUsers();
        }
        break;
      case "/join":
        if (checkMessageCommandParams(allArguments, 2)) {
          void joinGroup(allArguments.slice(1));
        }
        break;
      case "/delete":
        if (checkMessageCommandParams(allArguments, 1)) {
          deleteGroup();
        }
        break;
      case "/revoke":
        if (allArguments.length >= 2) {
          void revokeUserPrivate(allArguments[1]!);
        } else {
          Notify.create({
            message: "Usage: /revoke username",
            color: "warning",
            position: "top",
            timeout: 2000,
          });
        }
        break;
      case "/kick":
        if (allArguments.length >= 2) {
          void kickUserByName(allArguments[1]!);
        } else {
          Notify.create({
            message: "Usage: /kick username",
            color: "warning",
            position: "top",
            timeout: 2000,
          });
        }
        break;
      case "/notifications":
        if (allArguments[1] === "on") {
          setNotificationsEnabled(true);
          Notify.create({ message: "Notifications enabled", color: "positive", position: "top", timeout: 2000 });
        } else if (allArguments[1] === "off") {
          setNotificationsEnabled(false);
          Notify.create({ message: "Notifications disabled", color: "info", position: "top", timeout: 2000 });
        }
        break;
      case "/mentions":
        if (allArguments[1] === "on") {
          setMentionOnlyNotifications(true);
          Notify.create({ message: "Mention-only notifications enabled", color: "positive", position: "top", timeout: 2000 });
        } else if (allArguments[1] === "off") {
          setMentionOnlyNotifications(false);
          Notify.create({ message: "Mention-only notifications disabled", color: "info", position: "top", timeout: 2000 });
        }
        break;
      default: {
        await sendMessageUsingSocket(inputText);
        break;
      }
    }
    text.value = "";
  }
}

async function sendMessageUsingSocket(inputText: string) {
  if (!currentGroupId.value) {
    console.error("No group selected");
    return;
  }
  try {
    await channelService.join(currentGroupId.value).sendMessage(inputText);
  } catch (err) {
    console.error("Failed to send message:", err);
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

async function login(username: string, password: string) {
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

function listPublicGroups() {
  dialogs.groupListPublic = true;
}

function listGroups() {
  dialogs.groupList = true;
}

function openCreateGroupDialog() {
  dialogs.groupCreate = true;
}

function deleteGroup() {
  dialogs.groupDelete = true;
}

async function inviteToGroup(args: string[]) {
  if (args.length != 1) {
    Notify.create({
      message: "Usage: /invite username",
      color: "warning",
    });
    return;
  }

  const username = args[0];

  if (!username || username == "") {
    Notify.create({
      message: "No username specified",
      color: "negative",
    });
    return;
  }

  if (currentGroupIsPrivate.value && !currentGroupIsOwner.value) {
    Notify.create({
      message: "Only the group owner can invite users to private groups",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {
    const channel = channelService.join(currentGroupId.value);
    const response = await channel.inviteUser(username);

    Notify.create({
      message: response.message || `Invitation sent to ${username}`,
      color: "positive",
    });
  } catch (err) {
    Notify.create({
      message: (err as Error).message || "Failed to send invitation",
      color: "negative",
    });
  }
}

function openDialog(user: TypingUser) {
  currentlyPeekedMessage.value = user.message;
  dialogs.userMessagePeek = true;
}
/*
function kickUser() {
  dialogs.userKick = true;
}

function revokeUser() {
  dialogs.userRevoke = true;
}*/

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

async function loadUserGroups(): Promise<void> {
  try {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    const user = response.data;

    console.log("User groups from API:", user.groups);

    if (user.groups) {
      groupLinks.value = user.groups.map(
        (group: {
          id: string;
          name: string;
          description: string | null;
          isPrivate: boolean;
          is_private: boolean;
          isOwner?: boolean ;
        }) => {
          console.log("Group:", group.name, "isOwner:", group.isOwner);
          return {
            id: group.id,
            title: group.name,
            caption: group.description || "",
            link: "",
            isPrivate: group.isPrivate || group.is_private,
            isOwner: group.isOwner || false,
          };
        },
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
    if (!currentGroupId.value) {
      Notify.create({
        message: "No group is currently selected",
        color: "warning",
        position: "top",
        timeout: 2000,
      });
      return;
    }

    try {
      const response = await api.post(`/groups/${currentGroupId.value}/leave`);

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
    return;
  }

  const groupName = args.join(" ");
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
  acceptInvitation,
  cancelGroup,
  changeGroup,
  changeStatus,
  currentGroupId,
  currentGroupIsOwner,
  currentGroupIsPrivate,
  currentGroupName,
  currentlyPeekedMessage,
  declineInvitation,
  deleteGroup,
  dialogs,
  displayedMembers,
  getUsernameAbbr,
  groupLinks,
  handleIncomingMessage,
  invitations,
  inviteToGroup,
  joinGroup,
  joinPublicGroup,
  kickUserByName,
  leaveGroupAPI,
  listGroups,
  listPublicGroups,
  loadGroupMembers,
  loadInvitations,
  loadMessages,
  loadPublicGroups,
  loadUserGroups,
  loggedUser,
  login,
  logout,
  mentionOnlyNotifications,
  messages,
  notificationsEnabled,
  openCreateGroupDialog,
  openDialog,
  publicGroups,
  register,
  requestNotificationPermission,
  resetGroupMembers,
  revokeUserPrivate,
  sendMessage,
  setMentionOnlyNotifications,
  setNotificationsEnabled,
  simulateIncomingInvite,
  text,
  typingUsers,
};