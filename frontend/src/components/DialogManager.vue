<template>
  <!--/list príkaz - zoznam členov -->
  <GroupListUsers
    :model-value="props.dialogs.groupUserList"
    @update:model-value="$emit('update-dialog','groupUserList',$event)"
  />
  <GroupList
    :model-value="props.dialogs.groupList"
    @update:model-value="$emit('update-dialog','groupList',$event)"
  />

  <GroupLeave
      :model-value="props.dialogs.groupLeave"
      @update:model-value="$emit('update-dialog','groupLeave',$event)"
  />
  <GroupCreate
      :model-value="props.dialogs.groupCreate"
      @update:model-value="$emit('update-dialog','groupCreate',$event)"
      />
  <GroupDelete
      :model-value="props.dialogs.groupDelete"
      @update:model-value="$emit('update-dialog','groupDelete',$event)"
      />

  <GroupInvite
      :model-value="props.dialogs.groupInvite"
      @update:model-value="$emit('update-dialog','groupInvite',$event)"
      />

</template>

<script setup lang="ts">
import GroupListUsers from 'components/dialogs/GroupListUsers.vue';
import GroupList from 'components/dialogs/GroupList.vue';
import GroupLeave from 'components/dialogs/GroupLeave.vue';
import GroupCreate from 'components/dialogs/GroupCreate.vue';
import GroupDelete from 'components/dialogs/GroupDelete.vue';
import GroupInvite from 'components/dialogs/GroupInvite.vue';

interface Props {
  dialogs: {
    groupList: boolean
    groupUserList: boolean
    groupLeave: boolean
    groupCreate: boolean
    groupDelete: boolean
    groupInvite: boolean
  }
  currentGroupName: string
  displayedMembers: Member[]
  loadGroupMembers: (index: number, done: (stop?: boolean) => void) => void
}

  interface Member {
    name: string
    avatar: string
  }

  const props = defineProps<Props>()

</script>
