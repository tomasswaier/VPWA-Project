import { ref } from "vue";
import type { SerializedMessage } from "../contracts/Message";

export const notificationsEnabled = ref(true);
export const mentionOnlyNotifications = ref(false);

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

export function showNativeNotification(
  title: string,
  body: string,
  onClick?: () => void,
) {
  if (!("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body: body,
    icon: "/favicon.ico",
    tag: "chat-notification",
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  setTimeout(() => notification.close(), 5000);
}

export function shouldShowNotification(
  message: SerializedMessage,
  appVisible: boolean,
  loggedUsername: string | undefined,
  userStatus: string | undefined,
): boolean {
  if (!notificationsEnabled.value) {
    return false;
  }
  if (appVisible) {
    return false;
  }
  if (userStatus === "do_not_disturb") {
    return false;
  }
  if (message.author === loggedUsername) {
    return false;
  }
  if (userStatus === "idle" && !message.containsMention) {
    return false;
  }
  if (mentionOnlyNotifications.value && !message.containsMention) {
    return false;
  }
  return true;
}

export function handleIncomingMessage(
  message: SerializedMessage,
  appVisible: boolean,
  loggedUsername: string | undefined,
  userStatus: string | undefined,
  currentGroupId: string,
  onNavigateToGroup: (groupId: string) => void,
) {
  console.log("handleIncomingMessage called", {
    message,
    appVisible,
    status: userStatus,
    notificationsEnabled: notificationsEnabled.value,
    shouldShow: shouldShowNotification(message, appVisible, loggedUsername, userStatus),
  });

  if (shouldShowNotification(message, appVisible, loggedUsername, userStatus)) {
    const bodyPreview = message.content.length > 50
      ? message.content.substring(0, 50) + "..."
      : message.content;
    showNativeNotification(`${message.author}`, bodyPreview, () => {
      if (message.groupId && message.groupId !== currentGroupId) {
        onNavigateToGroup(message.groupId);
      }
    });
  }
}

export function setNotificationsEnabled(enabled: boolean) {
  notificationsEnabled.value = enabled;
  if (enabled) {
    void requestNotificationPermission();
  }
}

export function setMentionOnlyNotifications(enabled: boolean) {
  mentionOnlyNotifications.value = enabled;
}
