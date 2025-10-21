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

        <DialogManager
          :dialogs="dialogs"
          :current-group-name="currentGroupName"
          :displayed-members="displayedMembers"
          :load-group-members="loadGroupMembers"
            @update-dialog="updateDialog"
        />
        <!--end of popups-->
        <div class="q-pa-md row justify-center">
          <div id="spravySem" style="width: 100%;">
            <q-infinite-scroll :offset="250" reverse @load="loadMessages">
              <div v-for="(message,index) in messages" :key="index" >
                <q-chat-message name="me"
                                :text="['I will be counting down from X']"
                bg-color="orange-1"
                sent
                />
              </div>
              <q-chat-message
                name="me"
                :text="['Hi Johnka how are you doing']"
                sent
                bg-color="orange-1"
              />
              <q-chat-message
                name="Johnka"
                :text="['doing fine, how r you?']"
                bg-color="secondary"
              />
              <q-chat-message
                name="Johnka"
                :text="['are you okay?']"
                bg-color="secondary"
              />
              <q-chat-message
                name="me"
                :text="['Not so good. My right hand died literally as Im writing this message']"
                sent
                bg-color="orange-1"
              />
              <q-chat-message
                name="me"
                :text="['From here on our messages will be cat ipsum']"
                sent
                bg-color="orange-1"
              />
              <q-chat-message
                name="me"
                sent
                bg-color="orange-1"
              />
              <q-chat-message
                name="Johnka"
                :text="['Yowling nonstop the whole night vommit food and eat it again. Stare out the window thinking longingly about tuna brine sit in box so ignore the squirrels, youll never catch them anyway. Flee in terror at cucumber discovered on floor licks paws but jump on fridge purr. Snuggles up to shoulders or knees and purrs you to sleep leave hair everywhere, or miaow then turn around and show you my bum naughty running cat and run off table persian cat jump eat fish. Walk on car leaving trail of paw prints on hood and windshield favor packaging over toy and good now the other hand, too or pet my belly, you know you want to; seize the hand and shred it! cat dog hate mouse eat string barf pillow no baths hate everything chirp at birds. Hey! you there, with the hands.']"
                bg-color="secondary"
                size="8"
              />
              <q-chat-message
                name="Marian Emanual Chornandez Pelko De la Muerto"
                :text="['Sit on the laptop. Cats are fats i like to pets them they like to meow back ha ha, youre funny ill kill you last, and kitty run to human with blood on mouth from frenzied attack on poor innocent mouse, dont i look cute? let me in let me out let me in let me out let me in let me out who broke this door anyway or destroy couch, and chase little red dot someday it will be mine!, or use lap as chair']"
                bg-color="secondary"
                size="8"
              />
            </q-infinite-scroll>

          </div>
        </div>
    <q-footer class="bg-white text-black q-pa-sm">
        <q-input rounded outlined v-model="text" label="Napíš správu..." class="full-width" @keyup.enter="sendMessage">
          <template v-slot:append>
            <q-btn flat round icon="send" @click="sendMessage" />
          </template>
        </q-input>
    </q-footer>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref} from 'vue';
import GroupLink, { type GroupLinkProps } from 'components/GroupLink.vue';
import HeaderToolbar from 'components/HeaderToolbar.vue';
import DialogManager from 'components/DialogManager.vue';
import { messages, loadMessages, sendMessage, text, confirmGroupLeave,
         dialogs, currentGroupName, displayedMembers, loadGroupMembers} from '../store/interactions';
         import type {Dialogs} from '../store/interactions';


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
function updateDialog(dialogName: keyof Dialogs,value:boolean){
  dialogs[dialogName] = value
}


</script>
