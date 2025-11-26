import type { SerializedMessage } from "src/contracts";
import { useChannelsStore } from "src/stores/channels";

import type { PaginatedMessages } from "../stores/interactions";

import { SocketManager } from "./SocketManager";

// import type { BootParams } from "./SocketManager";
interface InviteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type JoinGroupResponse = {
  success: true;
} | { error: string };

export class ChannelSocketManager extends SocketManager {
  constructor(groupId: string) {
    super(`/groups/${groupId}`); // namespace per groupId
  }
  public inviteUser(
    username: string,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      this.socket.emit("inviteUser", { username }, (res: InviteResponse) => {
        if (res.error) {
          return reject(new Error(res.error));
        }
        resolve(res);
      });
    });
  }

  public subscribe(): void {
    this.socket.off("message"); // clear old listeners
    this.socket.on("message", (message: SerializedMessage) => {
      const channelsStore = useChannelsStore();
      channelsStore.receiveMessage({
        channel: this.namespace, // keep track of which group
        message,
      });
    });
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
  public voteKick(username: string): Promise<{banned: boolean; message: string}> {
    const groupId = this.namespace.split("/").pop();
    if (!groupId || username == "") {
      return Promise.reject(new Error("No groupId"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "voteKick",
        { groupId, username },
        (res: { banned: boolean; message: string } | { error: string }) => {
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
}
export default new ChannelService();
