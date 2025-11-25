import type { SerializedMessage } from "src/contracts";
import { useChannelsStore } from "src/stores/channels";

import type { PaginatedMessages } from "../stores/interactions";

import { SocketManager } from "./SocketManager";

// import type { BootParams } from "./SocketManager";

export class ChannelSocketManager extends SocketManager {
  private isSubscribed = false;
  private groupId: string | null = null;
  constructor(groupId: string) {
    super("/groups");
    this.groupId = groupId;
  }
  public async setGroup(groupId: string) {
    this.groupId = groupId;
    await this.joinGroup();

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public subscribe(): void {
    if (this.isSubscribed) {
      return; // Prevent duplicate subscriptions
    }
    this.isSubscribed = true;

    this.socket.off("message"); // Clean previous listeners (if any)

    this.socket.on("message", (message: SerializedMessage) => {
      if (!this.groupId) {
        return;
      }

      const channelsStore = useChannelsStore();
      channelsStore.receiveMessage({
        channel: this.groupId,
        message,
      });
    });
  }

  public joinGroup(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "joinGroup",
        this.groupId,
        (res: { success?: boolean; error?: string }) => {
          if (res.success) {
            resolve();
          } else {
            reject(new Error(res.error));
          }
        },
      );
    });
  }

  public sendMessage(content: string): Promise<SerializedMessage> {
    if (!this.groupId) {
      return Promise.reject(new Error("No group selected"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "sendMessage",
        { groupId: this.groupId, content },
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
    if (!this.groupId) {
      return Promise.reject(new Error("No group selected"));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "loadMessages",
        this.groupId,
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
    await channel.setGroup(groupId);
  }
}
export default new ChannelService();
