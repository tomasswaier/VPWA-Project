import { defineStore } from "pinia";

import type { RawMessage, SerializedMessage } from "../contracts/Message";
import type { QVueGlobals } from "quasar";
import channelService from "../services/ChannelService";
import { messages, handleIncomingMessage } from "../stores/interactions";

export interface ChannelsStateInterface {
  loading: boolean;
  error: Error | null;
  messages: { [channel: string]: SerializedMessage[] };
  active: string | null;
}

let $q: QVueGlobals | null = null;

export function initChannelsQuasar(quasar: QVueGlobals) {
  $q = quasar;
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
        const response = await channelService.join(channel).loadMessages();
        this.messages[channel] = response.data;
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
      await channelService.in(channel)?.sendMessage(message);
    },

    receiveMessage(
      { channel, message }: { channel: string; message: SerializedMessage },
    ) {
      if (!this.messages[channel]) {
        this.messages[channel] = [];
      }
      this.messages[channel]?.push(message);
      messages.value.push(message);

      const appVisible = $q?.appVisible ?? true;
      handleIncomingMessage(message, appVisible);
    },

    setActive(channel: string) {
      this.active = channel;
    },
  },
});