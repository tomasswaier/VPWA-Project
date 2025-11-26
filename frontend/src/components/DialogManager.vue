<template>
  <GroupListUsers
    :model-value="props.dialogs.groupUserList"
    @update:model-value="$emit('update-dialog','groupUserList',$event)"
  />
  <GroupList
    :model-value="props.dialogs.groupList"
    @update:model-value="$emit('update-dialog','groupList',$event)"
  />
  <GroupListPublic
    :model-value="props.dialogs.groupListPublic"
    @update:model-value="$emit('update-dialog','groupListPublic',$event)"
  />

  <ConfirmAction
      :model-value="props.dialogs.groupLeave"
      model-message="Are you sure you want to leave this group?"
      @update:model-value="$emit('update-dialog','groupLeave',$event)"
      />
  <GroupCreate
      :model-value="props.dialogs.groupCreate"
      @update:model-value="$emit('update-dialog','groupCreate',$event)"
      />
  <ConfirmAction
      :model-value="props.dialogs.groupDelete"
      @update:model-value="$emit('update-dialog','groupDelete',$event)"
      model-message="Are you sure you want to DELETE this group?"
      :on-confirm="groupDeleteWrapper"
      />
  <ConfirmAction
      :model-value="props.dialogs.userRevoke"
      @update:model-value="$emit('update-dialog','userRevoke',$event)"
      model-message="Are you sure you want to revoke this users rights??"
      :on-confirm="revokeUserWrapper"
      />
  <ConfirmAction
      :model-value="props.dialogs.userKick"
      @update:model-value="$emit('update-dialog','userKick',$event)"
      model-message="Are you sure you want KICK this user?"
      :on-confirm="kickUserWrapper"
      />

  <UserMessagePeek
      :model-value="props.dialogs.userMessagePeek"
      :model-message=currentlyPeekedMessage
      @update:model-value="$emit('update-dialog','userMessagePeek',$event)"
      />

</template>
<script setup lang="ts">
import { Notify } from "quasar";

// Dialog components
import GroupListUsers from "components/dialogs/GroupListUsers.vue";
import GroupList from "components/dialogs/GroupList.vue";
import GroupListPublic from "components/dialogs/GroupListPublic.vue";
import ConfirmAction from "components/dialogs/ConfirmAction.vue";
import GroupCreate from "components/dialogs/GroupCreate.vue";
import UserMessagePeek from "components/dialogs/UserMessagePeek.vue";

// Stores
import { currentlyPeekedMessage,targetUser,currentGroupId } from "src/stores/interactions";
import type { User } from "src/stores/interactions";

// Services
import channelService from "src/services/ChannelService";

interface Props {
  dialogs: {
    groupList: boolean;
    groupListPublic: boolean;
    groupUserList: boolean;
    groupLeave: boolean;
    groupCreate: boolean;
    groupDelete: boolean;
    groupInvite: boolean;
    userKick: boolean;
    userRevoke: boolean;
    userMessagePeek: boolean;
  };
  currentGroupName: string;
  displayedMembers: User[];
  loadGroupMembers: (
    index: number,
    done: (stop?: boolean) => void
  ) => void;
}

const props = defineProps<Props>();

async function kickUserWrapper() {
  if (!props.currentGroupName) {
    Notify.create({
      message: "No group selected",
      color: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {

      const channel = channelService.in(currentGroupId.value);
      if (!channel) {
        throw new Error("Channel not found");
      }

      const response =await channel.kickUser(targetUser.value);



    console.log(response);
    if (response.success) {
      Notify.create({
        message: response.message || "Vote recorded",
        color: "positive",
        position: "top",
        timeout: 2000,
      });
    } else {
      Notify.create({
        message: response.error || "Failed to vote kick",
        color: "negative",
        position: "top",
        timeout: 2000,
      });
    }
    targetUser.value="";
  } catch (err) {
    console.error("Failed to vote kick:", err);
    Notify.create({
      message: "An unexpected error occurred",
      color: "negative",
      position: "top",
      timeout: 2000,
    });
  }
  targetUser.value="";
}

// Placeholder wrappers for other actions
function groupDeleteWrapper() {}
function revokeUserWrapper() {}

</script>

