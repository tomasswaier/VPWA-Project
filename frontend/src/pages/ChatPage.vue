<template>
  <DialogManager
    :dialogs="props.dialogs"
    :current-group-name="currentGroupName"
    :displayed-members="displayedMembers"
    :load-group-members="loadGroupMembers"
    @update-dialog="updateDialog"
  />
  <q-page class="flex column">
    <div class="col overflow-auto q-pa-md" id="chatMessages" ref="chatContainer" style="max-height: calc(100vh - 160px);">
    <q-infinite-scroll
      :offset="250"
      reverse
      @load="loadMessages"
    >
      <div v-for="(message, index) in messages" :key="message.id">
        <q-chat-message
          :name="message.author"
          :text="[message.content]"
          :sent="message.author === loggedUser!.username"
          :id="index.toString()"
          :bg-color="message.containsMention
            ? 'yellow-6'
            : (message.author === loggedUser!.username ? 'orange-1' : 'secondary')"
        />
      </div>

      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    </div>
    <div class="col-auto q-pa-sm bg-white">
      <div v-if="someoneTyping" >
          <q-btn-dropdown color="primary" cover label="someone is typing...">
            <q-list>
              <q-item v-for="(user,index) in typingUsers" :key="index"  clickable @click="openDialog(user)">
                <q-item-section :id="index.toString()" >{{user.name}}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
      </div>
      <q-input
        rounded
        outlined
        v-model="text"
        label="Napíš správu..."
        @keyup.enter="sendMessage"
        dense
      >
        <template v-slot:append>
          <q-btn flat round dense icon="send" @click="sendMessage" />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogManager from 'components/DialogManager.vue';
import type { Dialogs } from '../stores/interactions';
import {
  messages,
  loadMessages,
  sendMessage,
  text,
  currentGroupName,
  displayedMembers,
  loadGroupMembers,
  typingUsers, openDialog,loggedUser
} from '../stores/interactions';

interface Props {
  dialogs: {
    groupList: boolean
    groupListPublic: boolean
    groupUserList: boolean
    groupLeave: boolean
    groupCreate: boolean
    groupDelete: boolean
    groupInvite: boolean
    userKick: boolean
    userRevoke: boolean
    userMessagePeek: boolean
    ConfirmDecision: boolean
  }
}


const props = defineProps<Props>();
const someoneTyping=true;

interface Emits {
  (e: 'update-dialog', dialogName: keyof Dialogs, value: boolean): void
}

const emit = defineEmits<Emits>();

const chatContainer = ref<HTMLElement | null>(null);

function updateDialog(dialogName: keyof Dialogs, value: boolean) {
  emit('update-dialog', dialogName, value);
}
</script>

<style scoped>
</style>