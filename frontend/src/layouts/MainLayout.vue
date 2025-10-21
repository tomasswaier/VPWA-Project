<template>

  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <HeaderToolbar @toggle-drawer="toggleDrawer()" />
    </q-header>
    <q-drawer class="bg-accent text-bold" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
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
import  type{ GroupLinkProps}  from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';

import {dialogs,joinGroup,listGroups} from '../store/interactions';
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
    isOwner:true,
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
