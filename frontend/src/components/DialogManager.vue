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

  <GroupLeave
      :model-value="props.dialogs.groupLeave"
      model-message="Are you sure you want to leave this group?"
      @update:model-value="$emit('update-dialog','groupLeave',$event)"
      />
  <GroupCreate
      :model-value="props.dialogs.groupCreate"
      @update:model-value="$emit('update-dialog','groupCreate',$event)"
      />
  <GroupLeave
      :model-value="props.dialogs.groupDelete"
      @update:model-value="$emit('update-dialog','groupDelete',$event)"
      model-message="Are you sure you want to DELETE this group?"
      />
  <GroupLeave
      :model-value="props.dialogs.userRevoke"
      @update:model-value="$emit('update-dialog','userRevoke',$event)"
      model-message="Are you sure you want to revoke this users rights??"
      />
  <GroupLeave
      :model-value="props.dialogs.userKick"
      @update:model-value="$emit('update-dialog','userKick',$event)"
      model-message="Are you sure you want KICK this user?"
      />

  <UserMessagePeek
      :model-value="props.dialogs.userMessagePeek"
      :model-message=currentlyPeekedMessage
      @update:model-value="$emit('update-dialog','userMessagePeek',$event)"
      />

</template>

<script setup lang="ts">
import GroupListUsers from 'components/dialogs/GroupListUsers.vue';
import GroupList from 'components/dialogs/GroupList.vue';
import GroupListPublic from 'components/dialogs/GroupListPublic.vue';
import GroupLeave from 'components/dialogs/GroupLeave.vue';
import GroupCreate from 'components/dialogs/GroupCreate.vue';
import UserMessagePeek from 'components/dialogs/UserMessagePeek.vue';
import {currentlyPeekedMessage} from "../stores/interactions"
import type{User} from "../stores/interactions"

interface Props {
  dialogs: {
    groupList: boolean
    groupListPublic: boolean
    groupUserList: boolean
    groupLeave: boolean
    groupCreate: boolean
    groupDelete: boolean
    groupInvite: boolean
    userKick: boolean
    userRevoke: boolean
    userMessagePeek: boolean
  }
  currentGroupName: string
  displayedMembers: User[]
  loadGroupMembers: (index: number, done: (stop?: boolean) => void) => void
}

  const props = defineProps<Props>()

</script>