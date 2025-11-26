<template>
  <q-toolbar>
    <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleDrawer" />

    <q-toolbar-title>Mickeys Clubhouse</q-toolbar-title>

    <q-btn class="" @click="logout" flat dense round icon="logout" aria-label="Meow" />

    <q-btn class="relative-position" flat dense round icon="person" aria-label="Profile">
      <q-badge
        v-if="loggedUser?.status as String== 'online'"
        color="light-green"
        floating
        rounded
        style="top: 3px; right: 3px;"
      />
      <q-badge
        v-if="loggedUser?.status as String== 'do_not_disturb'"
        color="red"
        floating
        rounded style="top: 3px; right: 3px;" />
      <q-badge
        v-if="loggedUser?.status as String== 'idle'"
        color="yellow"
        floating
        rounded style="top: 3px; right: 3px;" />
      <q-badge
        v-if="loggedUser?.status as String== 'offline'"
        color="grey"
        floating
        rounded
        style="top: 3px; right: 3px;"
      />

      <q-menu
        transition-show="slide-down"
        transition-hide="slide-up"
        :offset="[0, 10]"
      >
        <q-card style="min-width: 250px;">
          <!-- profil časť -->
          <q-card-section class="text-center q-pb-none">
            <div class="text-h6 q-mt-sm" v-if="loggedUser">{{ loggedUser.username }}</div>
          </q-card-section>

          <q-separator class="q-my-md" />

          <!-- status časť -->
          <q-card-section class="q-pt-none">
            <div class="text-caption text-grey-7 q-mb-sm">Status</div>

            <q-list dense>
              <q-item clickable v-ripple @click="changeStatus('online')" :active="loggedUser?.status == 'online'">
                <q-item-section avatar>
                  <q-icon name="circle" color="light-green" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Online</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="changeStatus('idle')" :active="loggedUser?.status == 'idle'">
                <q-item-section avatar>
                  <q-icon name="do_not_disturb" color="yellow" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Idle</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="changeStatus('do_not_disturb')" :active="loggedUser?.status == 'do_not_disturb'">
                <q-item-section avatar>
                  <q-icon name="do_not_disturb" color="red" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Do Not Disturb</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="changeStatus('offline')" :active="loggedUser?.status == 'offline'">
                <q-item-section avatar>
                  <q-icon name="circle" color="grey" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Offline</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-menu>
    </q-btn>

  </q-toolbar>
</template>


<script setup lang="ts">
  //import {ref} from 'vue';
  import {logout,loggedUser,changeStatus } from '../stores/interactions';


  const emit = defineEmits<{
    toggleDrawer: []
  }>()

  function toggleDrawer() {
    emit('toggleDrawer')
  }

  //const userStatus = ref<'online' | 'dnd' | 'offline'>('online');
  //loggedUser.status=userStatus
</script>
