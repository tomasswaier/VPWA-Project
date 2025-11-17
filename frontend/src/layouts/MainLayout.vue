<template>

  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <HeaderToolbar @toggle-drawer="toggleDrawer()" />
    </q-header>
    <q-drawer class="bg-accent text-bold" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list style="height: 90vh; overflow-y: auto;">
        <!--the user will NOT be part of thousands of groups-->
        <q-item-label header> Groups </q-item-label>
        <GroupLink :dialogs="dialogs" v-for="link in groupLinks" :key="link.title" v-bind="link" />
      </q-list>
      <div class="q-pa-md fixed-bottom">
        <q-btn class="col bottom" @click="joinGroup"  flat dense round icon="add" aria-label="Meow" />
        <q-btn class="col-auto bottom" @click="listGroups"  flat dense round icon="list" aria-label="Meow" />
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
import {ref} from 'vue';
import GroupLink  from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';

import {dialogs,joinGroup,listGroups,groupLinks,sortGroupLinksByInvites} from '../stores/interactions';
import type {Dialogs} from '../stores/interactions';


const leftDrawerOpen = ref(false);
function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}//keep it a function for better readability no ?

function updateDialog(dialogName: keyof Dialogs,value:boolean){
  dialogs[dialogName] = value
}
sortGroupLinksByInvites(groupLinks);

</script>
