<template>
  <!--/list príkaz - zoznam členov -->
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
</template>

<script setup lang="ts">
import GroupList from 'components/dialogs/GroupList.vue';
import GroupLeave from 'components/dialogs/GroupLeave.vue';
import GroupCreate from 'components/dialogs/GroupCreate.vue';

interface Props {
  dialogs: {
    groupList: boolean
    groupLeave: boolean
    groupCreate: boolean
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
