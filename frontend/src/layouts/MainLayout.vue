<template>

  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>Mickeys Clubhouse</q-toolbar-title>

        <q-btn class="" to="/login" flat dense round icon="login" aria-label="Meow" />
        <q-btn class="" flat dense round icon="logout" aria-label=""  />
        
        <q-btn class="relative-position" flat dense round icon="person" aria-label="Profile">
          <q-badge 
            v-if="userStatus === 'online'" 
            color="light-green" 
            floating 
            rounded 
            style="top: 3px; right: 3px;"
          />
          <q-badge 
            v-if="userStatus === 'dnd'" 
            color="red" 
            floating 
            rounded 
            style="top: 3px; right: 3px;"
          />
          <q-badge 
            v-if="userStatus === 'offline'" 
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
                <q-avatar size="80px">
                  <img src="https://cdn.quasar.dev/img/avatar4.jpg" alt="User Avatar">
                </q-avatar>
                <div class="text-h6 q-mt-sm">Tomáško Truman</div>
              </q-card-section>

              <q-separator class="q-my-md" />

              <!-- status časť -->
              <q-card-section class="q-pt-none">
                <div class="text-caption text-grey-7 q-mb-sm">Status</div>
                
                <q-list dense>
                  <q-item clickable v-ripple @click="userStatus = 'online'" :active="userStatus === 'online'">
                    <q-item-section avatar>
                      <q-icon name="circle" color="light-green" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Online</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-ripple @click="userStatus = 'dnd'" :active="userStatus === 'dnd'">
                    <q-item-section avatar>
                      <q-icon name="do_not_disturb" color="red" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Do Not Disturb</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-ripple @click="userStatus = 'offline'" :active="userStatus === 'offline'">
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
    </q-header>
    <q-drawer class="bg-accent text-bold" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Groups </q-item-label>

        <EssentialLink v-for="link in groupLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- start of popups-->
        <q-dialog v-model="confirmGroupLeave" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <span class="q-ml-sm">Are you sure you want to leave this group?</span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="No" color="primary" v-close-popup />
              <q-btn flat label="Yes" color="primary"  v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        
        <!--/list príkaz - zoznam členov -->
        <q-dialog
          v-model="displayGroupList"
          persistent
          :maximized="maximizedToggle"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="bg-primary text-white" style="min-width: 500px;">
            <q-bar>
              <q-space />
              <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
                <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
                <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip class="bg-white text-primary">Close</q-tooltip>
              </q-btn>
            </q-bar>

            <q-card-section class="text-center">
              <div class="text-h5 text-white text-weight-bold">{{ currentGroupName }}</div>
            </q-card-section>

            <q-separator color="white" />

            <q-card-section class="q-pt-md" style="padding: 0;">
              <q-scroll-area style="height: 60vh; width: 100%;">
                <q-infinite-scroll :offset="250" @load="loadGroupMembers">
                  <q-list>
                    <q-item v-for="(member, index) in displayedMembers" :key="index" class="q-mb-sm">
                      <q-item-section avatar>
                        <q-avatar>
                          <img :src="member.avatar" :alt="member.name">
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-white text-weight-medium">{{ member.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                      <q-spinner-dots color="white" size="40px" />
                    </div>
                  </template>
                </q-infinite-scroll>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </q-dialog>
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
import { ref, watch} from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { messages, loadMessages, sendMessage, text, confirmGroupLeave, 
        displayGroupList, maximizedToggle, currentGroupName, displayedMembers, loadGroupMembers} from '../store/interactions';

const groupLinks: EssentialLinkProps[] = [
  {
    title: 'Group#1',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'SuperGroup',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'Minecraft Group',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'Disabled group',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  }
];

const leftDrawerOpen = ref(false);
const userStatus = ref<'online' | 'dnd' | 'offline'>('online');


function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

watch(displayGroupList, (isOpen) => {
  if (isOpen) {
    //po otvorení (pop-upu) sa načítajú členovia skupiny
    setTimeout(() => {
      if (displayedMembers.value.length === 0) {
        loadGroupMembers(0, () => {});
      }
    }, 100);
  }
});

</script>
