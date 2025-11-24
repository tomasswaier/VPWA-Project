import type { RawMessage, SerializedMessage } from "src/contracts";
import { useChannelsStore } from "src/stores/channels";

import { SocketManager } from "./SocketManager";
// import type { BootParams } from "./SocketManager";

// creating instance of this class automatically connects to given socket.io
// namespace subscribe is called with boot params, so you can use it to
class ChannelSocketManager extends SocketManager {
  public subscribe(): void {
    this.socket.on("message", (message: SerializedMessage) => {
      const channelsStore = useChannelsStore();
      channelsStore.receiveMessage({ channel: this.namespace, message });
    });
  }

  public addMessage(message: RawMessage): Promise<SerializedMessage> {
    return this.emitAsync("addMessage", message);
  }

  public loadMessages(): Promise<SerializedMessage[]> {
    return this.emitAsync("loadMessages");
  }
}

class ChannelService {
  private channels: Map<string, ChannelSocketManager> = new Map();

  public join(name: string): ChannelSocketManager {
    if (this.channels.has(name)) {
      throw new Error(`User is already joined in channel "${name}"`);
    }

    // connect to given channel namespace
    const channel = new ChannelSocketManager(`/channels/${name}`);
    this.channels.set(name, channel);
    return channel;
  }

  public leave(name: string): boolean {
    const channel = this.channels.get(name);

    if (!channel) {
      return false;
    }

    // disconnect namespace and remove references to socket
    channel.destroy();
    return this.channels.delete(name);
  }

  public in(name: string): ChannelSocketManager | undefined {
    return this.channels.get(name);
  }
}
export default new ChannelService();
