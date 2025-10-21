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
    </q-drawer>

    <q-page-container>
      <!-- start of popups-->

        <!--end of popups-->
        <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref} from 'vue';
import GroupLink, { type GroupLinkProps } from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';


const groupLinks: GroupLinkProps[] = [
  {
    title: 'Group#1',
    caption: 'Gaming group',
    link: 'https://quasar.dev',
  },
  {
    title: 'SuperGroup',
    caption: 'Omega good groupgroup',
    link: 'https://quasar.dev',
  },
  {
    title: 'Minecraft Group',
    caption: 'group for minecraft fans',
    link: 'https://quasar.dev',
  },
  {
    title: 'Disabled group',
    caption: 'group for people who like to game disabled',
    link: 'https://quasar.dev',
  }
];
const leftDrawerOpen = ref(false);
function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}//keep it a function for better readability no ?


</script>
