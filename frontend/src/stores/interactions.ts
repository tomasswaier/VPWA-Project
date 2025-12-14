import { Notify } from "quasar";
import { reactive, ref } from "vue";

import channelService from "../services/ChannelService";
import type { SerializedMessage } from "../contracts/Message";
import { currentGroupId, resetGroupMembers, changeGroup } from "./groups";
import { text, sendMessageUsingSocket, messages } from "./messages";
import { setNotificationsEnabled, setMentionOnlyNotifications, handleIncomingMessage as handleIncomingMessageInternal } from "./notifications";
import { loggedUser } from "./user-auth";

//re-export from other modules
export type { User, UserStatus, RegisterResponse, LoginResponse } from "./user-auth";
export type { GroupLinkProps } from "./groups";
export type { PaginatedMessages } from "./messages";

export {
  loggedUser,
  previousStatus,
  register,
  login,
  logout,
  changeStatus,
  getUsernameAbbr,
} from "./user-auth";

export {
  currentGroupId,
  currentGroupName,
  displayedMembers,
  groupLinks,
  publicGroups,
  invitations,
  loadGroupMembers,
  loadPublicGroups,
  loadInvitations,
  acceptInvitation,
  declineInvitation,
  resetGroupMembers,
  updateMemberStatus,
  changeGroup,
  joinGroup,
  inviteToGroup,
  joinPublicGroup,
  leaveGroupAPI,
  loadUserGroups,
  cancelGroup,
} from "./groups";

export {
  page,
  finished,
  messages,
  text,
  loadMessages,
  sendMessageUsingSocket,
} from "./messages";

export {
  notificationsEnabled,
  mentionOnlyNotifications,
  requestNotificationPermission,
  showNativeNotification,
  setNotificationsEnabled,
  setMentionOnlyNotifications,
} from "./notifications";

// Wrapper for handleIncomingMessage to maintain backward compatibility
export function handleIncomingMessage(
  message: SerializedMessage,
  appVisible: boolean,
) {
  handleIncomingMessageInternal(
    message,
    appVisible,
    loggedUser.value?.username,
    loggedUser.value?.status,
    currentGroupId.value,
    (groupId: string) => void changeGroup(groupId),
  );
}

// Typing functionality
export interface TypingUser {
  name: string;
  message: string;
}

export const typingUsers = ref<TypingUser[]>([]);
export const currentlyPeekedUserIndex = ref(-1);
export const someoneTyping = ref(true);

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function startTypingWatcher() {
  const content = text.value.trim();
  const isTyping = content.length > 0;

  if (isTyping) {
    channelService.socket(currentGroupId.value)?.emit("typing", {
      groupId: currentGroupId.value,
      isTyping: true,
      preview: content,
    });
  }

  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }

  if (isTyping) {
    setTimeout(() => {
      const now = text.value.trim();
      console.log("sprava " + now);

      if (now.length === 0) {
        typingTimeout = null;
        channelService.socket(currentGroupId.value)?.emit("typing", {
          groupId: currentGroupId.value,
          isTyping: false,
          preview: "",
        });
      }
    }, 500);
  }
}

// Dialog functionality
export interface Dialogs {
  groupLeave: boolean;
  groupList: boolean;
  groupListPublic: boolean;
  groupCreate: boolean;
  groupDelete: boolean;
  groupInvite: boolean;
  groupUserList: boolean;
  userKick: boolean;
  userRevoke: boolean;
  userMessagePeek: boolean;
}

export const dialogs: Dialogs = reactive({
  groupLeave: false,
  groupList: false,
  groupListPublic: false,
  groupCreate: false,
  groupDelete: false,
  groupInvite: false,
  groupUserList: false,
  userKick: false,
  userRevoke: false,
  userMessagePeek: false,
});

export const targetUser = ref("");

export function listGroupUsers() {
  resetGroupMembers();
  dialogs.groupUserList = true;
}

export function listPublicGroups() {
  dialogs.groupListPublic = true;
}

export function listGroups() {
  dialogs.groupList = true;
}

export function openCreateGroupDialog() {
  dialogs.groupCreate = true;
}

export function deleteGroup() {
  dialogs.groupDelete = true;
}

export function openDialog(index: number) {
  currentlyPeekedUserIndex.value = index;
  dialogs.userMessagePeek = true;
  console.log(typingUsers.value[currentlyPeekedUserIndex.value]?.message);
}

export function kickUser() {
  dialogs.userKick = true;
}

export function revokeUser() {
  dialogs.userRevoke = true;
}

//command handling
function checkMessageCommandParams(
  input: string[],
  expectedCount: number,
): boolean {
  if (input.length < expectedCount) {
    console.log("too few parameters. User /help to show all commands");
    return false;
  } else if (input.length > expectedCount) {
    console.log("too many parameters. User /help to show all commands");
  }
  return true;
}

export async function sendMessage() {
  const inputText: string = text.value.trim();
  const allArguments: string[] = inputText.split(" ");
  if (inputText) {
    const firstArg: string = allArguments[0] as string;
    switch (firstArg) {
      case "/test":
        console.log(messages);
        break;
      case "/help":
        messages.value.push(
          {
            content: `Available commands`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content:
              `/cancel = leave group (deletes group if you're the creator)`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content: `/list = lists all public groups`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content:
              `/join [groupName] "[private]" [group description] = join public group with this groupName, join private group with groupName or create group by groupName. if argument [private] the created group will be private. All text unrecognized text will be treated as group description`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content: `/delete = delete the current group if owner`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content:
              `/revoke [userName] = group creator may use this to revoke ban of a user.`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content:
              `/kick [userName] = casts a vote to kick user userName out of this group. If three people cast this vote the person will be kicked out.`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content: `/notifications on|off = enable or disable notifications`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
          {
            content:
              `/mentions on|off = receive notifications only for mentions`,
            groupId: currentGroupId.value,
            id: 0,
            author: "",
            containsMention: false,
          },
        );
        break;
      case "/quit":
        {
          const { cancelGroup } = await import("./groups");
          void cancelGroup(allArguments.slice(1));
        }
        break;
      case "/cancel":
        {
          const { cancelGroup } = await import("./groups");
          void cancelGroup(allArguments.slice(1));
        }
        break;
      case "/invite":
        if (checkMessageCommandParams(allArguments, 2)) {
          const { inviteToGroup } = await import("./groups");
          void inviteToGroup(allArguments.slice(1));
        }
        break;
      case "/list":
        if (checkMessageCommandParams(allArguments, 1)) {
          listGroupUsers();
        }
        break;
      case "/join":
        if (checkMessageCommandParams(allArguments, 2)) {
          const { joinGroup } = await import("./groups");
          void joinGroup(allArguments.slice(1));
        }
        break;
      case "/revoke":
        if (checkMessageCommandParams(allArguments, 2)) {
          targetUser.value = allArguments[1]!;
          revokeUser();
        }
        break;
      case "/kick":
        if (checkMessageCommandParams(allArguments, 2)) {
          targetUser.value = allArguments[1]!;
          kickUser();
        }
        break;
      case "/notifications":
        if (allArguments[1] === "on") {
          setNotificationsEnabled(true);
          Notify.create({
            message: "Notifications enabled",
            color: "positive",
            position: "top",
            timeout: 2000,
          });
        } else if (allArguments[1] === "off") {
          setNotificationsEnabled(false);
          Notify.create({
            message: "Notifications disabled",
            color: "info",
            position: "top",
            timeout: 2000,
          });
        }
        break;
      case "/mentions":
        if (allArguments[1] === "on") {
          setMentionOnlyNotifications(true);
          Notify.create({
            message: "Mention-only notifications enabled",
            color: "positive",
            position: "top",
            timeout: 2000,
          });
        } else if (allArguments[1] === "off") {
          setMentionOnlyNotifications(false);
          Notify.create({
            message: "Mention-only notifications disabled",
            color: "info",
            position: "top",
            timeout: 2000,
          });
        }
        break;
      default: {
        await sendMessageUsingSocket(inputText);
        break;
      }
    }
    text.value = "";
  }
}
