<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <HeaderToolbar @toggle-drawer="toggleDrawer()" />
    </q-header>
    <q-drawer class="bg-accent text-bold" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list style="height: 90vh; overflow-y: auto;">
        <q-item-label header> Groups </q-item-label>
        <q-item v-show="invitations.length > 0" clickable @click="listGroups">

          <q-item-section >
            <span>
              You have <span class="text-red">{{ invitations.length }}</span> new Invitations
            </span>
          </q-item-section>
          <q-item-section side >
          </q-item-section>
        </q-item>
        <GroupLink :dialogs="dialogs" v-for="link in groupLinks" :key="link.title" v-bind="link" />
      </q-list>
      <div class="q-pa-md fixed-bottom">
        <q-btn class="col bottom" @click="openCreateGroupDialog" flat dense round icon="add" aria-label="Create Group" />
        <q-btn class="col-auto bottom" @click="listPublicGroups" flat dense round icon="list" aria-label="Public Groups" />
       </div>
    </q-drawer>
    <q-page-container>
        <router-view :dialogs="dialogs"
      @update-dialog="updateDialog"
          />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import GroupLink from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';
import { dialogs, openCreateGroupDialog, listGroups, listPublicGroups, groupLinks, loadUserGroups, invitations, loadInvitations } from '../stores/interactions';
import { initChannelsQuasar } from '../stores/channels';
import type { Dialogs } from '../stores/interactions';

const $q = useQuasar();
const leftDrawerOpen = ref(false);

function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function updateDialog(dialogName: keyof Dialogs, value: boolean) {
  dialogs[dialogName] = value;
}

onMounted(() => {
  initChannelsQuasar($q);
  void loadUserGroups();
  void loadInvitations(0, () => {});
});
</script>
