<template>
<q-item :class="{'bg-primary text-white':isPrivate,'rounded-borders':isInvite}" class="q-pa-md">
  <div class="row items-center full-width no-wrap">
    <div class="col" clickable tag="a" :href="link">
      <q-item-section class="ellipsis">
        <q-item-label class="ellipsis">{{ title }}</q-item-label>
        <q-item-label caption class="ellipsis">{{ caption }}</q-item-label>
        <q-item-tag v-if="isInvite">Invitation</q-item-tag>
      </q-item-section>
    </div>

    <div v-if="isInvite !== true" class="col-auto q-pl-md">
      <q-btn-dropdown color="primary" @click.stop dense>
        <q-list>
          <q-item clickable @click="leaveGroup" v-close-popup >
            <q-item-section>
              <q-item-label>Leave Group</q-item-label>
            </q-item-section>

          </q-item>
          <q-item clickable @click="inviteGroup" v-close-popup>
            <q-item-section>
              <q-item-label>Invite to</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="isOwner" clickable @click="deleteGroup" v-close-popup >
            <q-item-section>
              <q-item-label>Delete Group</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</q-item>
</template>

import
<script setup lang="ts">
import {leaveGroup,deleteGroup,inviteGroup} from '../store/interactions';
import type {GroupLinkProps} from '../store/interactions';

export

interface FullProps extends GroupLinkProps {
  dialogs: {
    groupList: boolean
    groupLeave: boolean
    groupCreate: boolean
    groupDelete: boolean
    groupInvite: boolean
  }
}

withDefaults(defineProps<FullProps>(), {
  caption: '',
  link: '#',
  isPrivate: false,
  isOwner: false,
  isInvite: false,
});

</script>
