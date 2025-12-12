import type { SerializedMessage } from "src/contracts";
import { useChannelsStore } from "src/stores/channels";

import type { PaginatedMessages, UserStatus } from "../stores/interactions";
import {
  currentGroupId,
  loggedUser,
  someoneTyping,
  typingUsers,
  updateMemberStatus,
} from "../stores/interactions";

import { SocketManager } from "./SocketManager";

// import type { BootParams } from "./SocketManager";
interface Response {
  success: boolean;
  message?: string;
  error?: string;
}

type JoinGroupResponse = {
  success: true;
} | { error: string };

export class ChannelSocketManager extends SocketManager {
  private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(groupId: string) {
    super(`/groups/${groupId}`); // namespace per groupId
  }
  public inviteUser(
    username: string,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      this.socket.emit("inviteUser", { username }, (res: Response) => {
        if (res.error) {
          return reject(new Error(res.error));
        }
        resolve(res);
      });
    });
  }

  public kickUser(username: string): Promise<Response> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId) {
      return Promise.reject(new Error("No groupId"));
    }
    if (!username) {
      return Promise.reject(new Error("Missing username"));
    }

    return new Promise((resolve) => {
      this.socket.emit(
        "voteKick",
        { username },
        (res: { banned?: boolean; message?: string; error?: string }) => {
          if (res.error) {
            resolve({ success: false, error: res.error });
          } else if (res.banned) {
            resolve({
              success: true,
              message: res.message || "User has been banned",
            });
          } else {
            resolve({
              success: true,
              message: res.message || "Vote recorded",
            });
          }
        },
      );
    });
  }

  public subscribe(): void {
    this.socket.off("message");
    this.socket.on("message", (message: SerializedMessage) => {
      const channelsStore = useChannelsStore();
      channelsStore.receiveMessage({
        channel: this.namespace,
        message,
      });
    });

    // sem som dal ten socket pre update-ovanie statusu v /list-e
    this.socket.off("userStatusChanged");
    this.socket.on("userStatusChanged", (data: {
      username: string;
      status: UserStatus;
    }) => {
      updateMemberStatus(data.username, data.status);
    });

    this.socket.off("typingUpdate");
    this.socket.on(
      "typingUpdate",
      (data: {
        groupId: string;
        userId: string;
        username: string;
        isTyping: boolean;
        preview: string;
      }) => {
        if (
          data.groupId !== currentGroupId.value ||
          data.username == loggedUser.value?.username
        ) {
          return;
        }

        const idx = typingUsers.value.findIndex((u) =>
          u.name === data.username
        );

        // Clear existing timeout for this user
        const existingTimeout = this.typingTimeouts.get(data.username);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          this.typingTimeouts.delete(data.username);
        }

        if (data.isTyping) {
          if (idx === -1) {
            typingUsers.value.push({
              name: data.username,
              message: data.preview,
            });
          } else {
            typingUsers.value[idx]!.message = data.preview;
          }

          //odstrani ten indikator pisania po 5 sekundach (prisiel mi to ako adekvatny casovy usek)
          const timeout = setTimeout(() => {
            const userIdx = typingUsers.value.findIndex((u) => u.name === data.username);
            if (userIdx !== -1) {
              typingUsers.value.splice(userIdx, 1);
              someoneTyping.value = typingUsers.value.length > 0;
            }
            this.typingTimeouts.delete(data.username);
          }, 5000);

          this.typingTimeouts.set(data.username, timeout);
        } else {
          if (idx !== -1) {
            typingUsers.value.splice(idx, 1);
          }
        }

        someoneTyping.value = typingUsers.value.length > 0;
      },
    );
  }

  public async joinGroup(): Promise<void> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId) {
      throw new Error("Missing groupId");
    }

    return new Promise<void>((resolve, reject) => {
      this.socket.emit("joinGroup", groupId, (res: JoinGroupResponse) => {
        if ("success" in res) {
          resolve();
        } else {
          reject(new Error(res.error));
        }
      });
    });
  }

  public sendMessage(content: string): Promise<SerializedMessage> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId) {
      return Promise.reject(new Error("No groupId"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "sendMessage",
        { groupId, content },
        (res: SerializedMessage | { error: string }) => {
          if ("error" in res) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        },
      );
    });
  }
  public voteKick(username: string): Promise<SerializedMessage> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId || username == "") {
      return Promise.reject(new Error("No groupId"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "voteKick",
        { groupId, username },
        (res: SerializedMessage | { error: string }) => {
          if ("error" in res) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        },
      );
    });
  }

  public loadMessages(page = 1): Promise<PaginatedMessages> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId) {
      return Promise.reject(new Error("No groupId"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "loadMessages",
        groupId,
        page,
        (res: PaginatedMessages | { error: string }) => {
          if ("error" in res) {
            reject(new Error(res.error));
          } else {
            resolve(res);
          }
        },
      );
    });
  }
  public getSocket() {
    return this.socket;
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map();

  public join(groupId: string): ChannelSocketManager {
    if (this.channels.has(groupId)) {
      return this.channels.get(groupId)!;
    }

    const channel = new ChannelSocketManager(groupId);
    this.channels.set(groupId, channel);
    return channel;
  }

  public leave(groupId: string): boolean {
    const channel = this.channels.get(groupId);
    if (!channel) {
      return false;
    }

    channel.destroy();
    return this.channels.delete(groupId);
  }

  public in(groupId: string): ChannelSocketManager | undefined {
    return this.channels.get(groupId);
  }

  public async setGroup(groupId: string) {
    const channel = this.channels.get(groupId);
    if (!channel) {
      throw new Error(`Channel ${groupId} not found`);
    }
    await channel.joinGroup();
  }

  // dc a reconnect pre offline status
  public disconnectAll(): void {
    this.channels.forEach((channel) => {
      channel.disconnect();
    });
  }

  public clearAll(): void {
    this.channels.forEach((channel) => {
      channel.destroy();
    });
    this.channels.clear();
  }
  public socket(groupId: string) {
    const channel = this.channels.get(groupId);
    if (!channel) {
      throw new Error("Channel not joined: " + groupId);
    }
    return channel.getSocket();
  }
}

export default new ChannelService();
