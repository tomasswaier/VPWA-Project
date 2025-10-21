<template>

  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <HeaderToolbar @toggle-drawer="toggleDrawer()" />
    </q-header>
    <q-drawer class="bg-accent text-bold" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Groups </q-item-label>
        <GroupLink v-for="link in groupLinks" :key="link.title" v-bind="link" />
      </q-list>
      <q-btn class="absolute-bottom"  flat dense round icon="add" aria-label="Meow" />
    </q-drawer>
    <q-page-container>
        <router-view :dialogs="dialogs"
      @update-dialog="updateDialog"
          />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref} from 'vue';
import GroupLink, { type GroupLinkProps } from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';

import {dialogs} from '../store/interactions';
import type {Dialogs} from '../store/interactions';


const groupLinks: GroupLinkProps[] = [
  {
    title: 'Group#1',
    caption: 'Gaming group',
    link: '',
    isPrivate:true,
  },
  {
    title: 'SuperGroup',
    caption: 'Omega good groupgroup',
    link: '',
  },
  {
    title: 'Minecraft Group',
    caption: 'group for minecraft fans',
    link: '',
    isPrivate:true,
  },
  {
    title: 'Disabled group',
    caption: 'group for people who like to game disabled',
    link: '',
  }
];
const leftDrawerOpen = ref(false);
function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}//keep it a function for better readability no ?

function updateDialog(dialogName: keyof Dialogs,value:boolean){
  dialogs[dialogName] = value
}

</script>
