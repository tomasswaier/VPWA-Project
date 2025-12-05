// import type { BootParams } from "./SocketManager";
import {
  changeGroup,
  currentGroupId,
  groupLinks,
  loadInvitations,
  loadUserGroups,
} from "../stores/interactions";

import { SocketManager } from "./SocketManager";

interface NotificationPayload {
  type: string;
  message: string;
  [key: string]: unknown;
}

export class PrivateSocketManager extends SocketManager {
  constructor() {
    super("/user");
  }

  public subscribe(): void {
    this.socket.off("kicked");
    this.socket.on("kicked", (data: { groupId: string; message: string }) => {
      console.warn("You were kicked from group:", data.groupId, data.message);
      void loadUserGroups();
      console.log(groupLinks);
      if (data.groupId == currentGroupId.value) {
        if (groupLinks.value.length > 0) {
          void changeGroup(groupLinks.value[0]!.id!);
        } else {
          void changeGroup("");
        }
      }
      console.log(currentGroupId.value);
    });

    this.socket.off("invited");
    this.socket.on("invited", (data: { groupId: string; inviter: string }) => {
      console.log("I've been invited !!!!");
      console.log(data);
      void loadInvitations(0, () => {});
    });

    this.socket.off("notification");
    this.socket.on("notification", (data: NotificationPayload) => {
      console.info("New notification:", data);
    });
  }
}

class PrivateService {
  private socketManager: PrivateSocketManager;

  constructor() {
    this.socketManager = new PrivateSocketManager();
  }

  public boot() {
    this.socketManager.subscribe();
    this.socketManager.socket.connect();
  }

  public getSocket() {
    return this.socketManager.socket;
  }
  
  //dc a reconnect pre offline status
  public disconnect() {
    this.socketManager.disconnect();
  }

  public reconnect() {
    this.socketManager.reconnect();
  }
}

export default new PrivateService();
