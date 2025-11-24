import { defineStore } from "pinia";

import type { RawMessage, SerializedMessage } from "../contracts/Message";
import channelService from "../services/ChannelService";

export interface ChannelsStateInterface {
  loading: boolean;
  error: Error | null;
  messages: { [channel: string]: SerializedMessage[] };
  active: string | null;
}

export const useChannelsStore = defineStore("channels", {
  state: (): ChannelsStateInterface => ({
    loading: false,
    error: null,
    messages: {},
    active: null,
  }),

  getters: {
    joinedChannels: (state) => Object.keys(state.messages),

    currentMessages: (state) =>
      state.active ? state.messages[state.active] : [],

    lastMessageOf: (state) => (channel: string) => {
      const msgs = state.messages[channel];
      return msgs?.length ? msgs[msgs.length - 1] : null;
    },
  },

  actions: {
    async join(channel: string) {
      try {
        this.loading = true;
        this.error = null;
        const messages = await channelService.join(channel).loadMessages();
        this.messages[channel] = messages;
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.error = err;
        } else {
          this.error = new Error("Unknown error occurred");
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    leave(channel: string | null) {
      const leaving = channel ? [channel] : this.joinedChannels;

      leaving.forEach((c) => {
        channelService.leave(c);
        delete this.messages[c];
      });

      this.active = null;
    },

    async addMessage(
      { channel, message }: { channel: string; message: RawMessage },
    ) {
      const newMessage = await channelService.in(channel)?.addMessage(message);
      this.messages[channel]!.push(newMessage!);
    },
    receiveMessage(
      { channel, message }: { channel: string; message: SerializedMessage },
    ) {
      if (!this.messages[channel]) {
        this.messages[channel] = [];
      }
      this.messages[channel]?.push(message);
    },

    setActive(channel: string) {
      this.active = channel;
    },
  },
});
