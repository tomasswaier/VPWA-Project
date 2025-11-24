// import type { User } from "./Auth";

export type RawMessage = string;

export interface SerializedMessage {
  content: string;
  groupId: number;
  // createdAt: string;
  // updatedAt: string;
  id: number;
  author: string;
  containsMention: boolean;
}
