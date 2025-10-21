<template>
  <!--/list príkaz - zoznam členov -->
  <GroupList
    :model-value="props.dialogs.groupList"
    @update:model-value="$emit('update-dialog','groupList',$event)"
  />
  <GroupLeave
      :model-value="props.dialogs.groupLeave"
  />
</template>

<script setup lang="ts">
import GroupList from 'components/dialogs/GroupList.vue';
import GroupLeave from 'components/dialogs/GroupLeave.vue';

interface Props {
  dialogs: {
    groupList: boolean
    groupLeave: boolean
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
