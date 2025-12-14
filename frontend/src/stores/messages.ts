import { ref } from "vue";
import { api } from "../boot/axios";
import type { SerializedMessage } from "../contracts/Message";
import channelService from "../services/ChannelService";

export interface PaginatedMessages {
  data: SerializedMessage[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    [k: string]: unknown;
  };
}

export const page = ref(1);
export const finished = ref(false);
export const messages = ref<SerializedMessage[]>([]);
export const text = ref("");

export function resetMessages() {
  finished.value = false;
  messages.value = [];
  page.value = 1;
}

export async function loadMessages(index: number, done: () => void) {
  const { currentGroupId } = await import("./groups");

  if (finished.value || currentGroupId.value === "") {
    done();
    return;
  }

  try {
    const res = await api.get(
      `/groups/${currentGroupId.value}/messages?page=${page.value}`,
    );

    const newMessages: SerializedMessage[] = (res.data as SerializedMessage[])
      .map((msg) => ({
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

export async function sendMessageUsingSocket(inputText: string) {
  const { currentGroupId } = await import("./groups");

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
