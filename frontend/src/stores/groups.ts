import type { AxiosError } from "axios";
import { Notify } from "quasar";
import { ref } from "vue";
import { api } from "../boot/axios";
import channelService from "../services/ChannelService";
import type { UserStatus, User } from "./user-auth";
import type { PaginatedMessages } from "./messages";

export interface GroupLinkProps {
  id?: string;
  title: string;
  caption?: string;
  link?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
}

export const currentGroupId = ref("");
export const currentGroupName = ref("");
export const displayedMembers = ref<User[]>([]);
export const groupLinks = ref<GroupLinkProps[]>([]);
export const publicGroups = ref<GroupLinkProps[]>([]);
export const invitations = ref<GroupLinkProps[]>([]);

export async function loadGroupMembers(
  index: number,
  done: () => void,
): Promise<void> {
  if (!currentGroupId.value) {
    done();
    return;
  }

  try {
    const response = await api.get(`/groups/${currentGroupId.value}/members`);
    const members = response.data;

    displayedMembers.value = members.map((
      member: { username: string; status: UserStatus; isOwner?: boolean },
    ) => ({
      username: member.username,
      status: member.status,
      isOwner: member.isOwner || false,
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

export async function loadPublicGroups(
  index: number,
  done: () => void,
): Promise<void> {
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

export async function loadInvitations(index: number, done: () => void): Promise<void> {
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

export async function acceptInvitation(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/accept-invitation`);

    await loadInvitations(0, () => {});
    await loadUserGroups();

    Notify.create({
      message: response.data.message || "Invitation accepted!",
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });
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
    await loadInvitations(0, () => {});
  }
}

export async function declineInvitation(groupId: string): Promise<void> {
  try {
    const response = await api.post(`/groups/${groupId}/decline-invitation`);

    Notify.create({
      message: response.data.message || "Invitation declined",
      color: "info",
      icon: "cancel",
      position: "top",
      timeout: 2000,
    });
    await loadInvitations(0, () => {});
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

export function resetGroupMembers(): void {
  displayedMembers.value = [];
}

export function updateMemberStatus(username: string, status: UserStatus): void {
  const member = displayedMembers.value.find((m) => m.username === username);
  if (member) {
    member.status = status;
  }
}

export async function changeGroup(groupId: string) {
  currentGroupId.value = groupId;

  // Import messages functions dynamically to avoid circular dependencies
  const { resetMessages } = await import("./messages");
  resetMessages();

  const group = groupLinks.value.find((g) => g.id === groupId);
  currentGroupName.value = group?.title || "";

  const { loggedUser } = await import("./user-auth");
  if (loggedUser.value?.status === "offline") {
    console.log("User is offline, not connecting to group socket");
    return;
  }

  try {
    const channel = channelService.join(groupId);
    await channelService.setGroup(groupId);
    const loadedMessages: PaginatedMessages = await channel.loadMessages(1);

    const { messages, page } = await import("./messages");
    messages.value = loadedMessages.data;
    page.value = 2;

    channel.subscribe();
  } catch (err) {
    console.error("Failed to change group:", err);
  }
}

export async function joinGroup(args: string[]) {
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
    if (response.data.error) {
      Notify.create({
        message: response.data.error,
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 2000,
      });
    } else {
      Notify.create({
        message: response.data.message,
        color: "positive",
        icon: "check_circle",
        position: "top",
        timeout: 2000,
      });
    }

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

export async function inviteToGroup(args: string[]) {
  if (args.length != 1) {
    Notify.create({
      message: "Usage: /invite username ",
      color: "warning",
    });
    return;
  }

  const username = args[0];

  if (!username || username == "") {
    Notify.create({
      message: `No username specified`,
      color: "negative",
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

export async function joinPublicGroup(groupId: string): Promise<void> {
  try {
    const group = publicGroups.value.find((g) => g.id === groupId);
    if (!group) {
      Notify.create({
        message: "Group not found",
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 2000,
      });
      return;
    }

    const hasInvitation = invitations.value.some((inv) => inv.id === groupId);

    if (hasInvitation) {
      await acceptInvitation(groupId);
    } else {
      const response = await api.post("/groups/join-or-create", {
        name: group.title,
        isPrivate: group.isPrivate || false,
        description: group.caption || null,
      });

      if (response.data.error) {
        Notify.create({
          message: response.data.error,
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 2000,
        });
      } else {
        Notify.create({
          message: response.data.message || "Successfully joined the group!",
          color: "positive",
          icon: "check_circle",
          position: "top",
          timeout: 2000,
        });
      }

      await loadInvitations(0, () => {});
      await loadUserGroups();
    }
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

export async function leaveGroupAPI(groupId: string): Promise<void> {
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

export async function loadUserGroups(): Promise<void> {
  try {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
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

export async function cancelGroup(args: string[]) {
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
