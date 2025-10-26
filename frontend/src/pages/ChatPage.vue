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
      <q-infinite-scroll :offset="250" reverse @load="loadMessages">
        <div v-for="(message, index) in messages" :key="index">
          <q-chat-message
            v-if="message.text"
            :name="message.sender"
            :text="[message.text]"
            :sent="message.sender === 'me'"
            :bg-color="message.isHighlighted ? 'yellow-3' : (message.sender === 'me' ? 'orange-1' : 'secondary')"
          />
          <q-chat-message
            v-else
            name="me"
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
              <q-item clickable  >
                <q-item-section>
                  <q-expansion-item caption="Johnka">
                    <q-card>
                      <q-card-section>
                        Ja som Johnka.Nemala som čas sa predstaviť. Som 22 ročná občanka Slovenskej Republiky a som an fiitke lebo som girlpop. Cat Ipsum Meow meow meow purr moew meow meow
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-item-section>
              </q-item>

              <q-item clickable >
                <q-item-section>
                  <q-expansion-item caption="Emanuel">
                    <q-card>
                      <q-card-section>
                        Ja som Emanuel.Nemal som čas sa predstaviť. Nie som 22 ročná občanka Slovenskej Republiky lebo som muž asi idk píšem lorem ipsum. Na fiitke niesom lebo to je ta spravna voľba. PPI je ****** ******* ***** by som **********
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-item-section>
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
import type { Dialogs } from '../store/interactions';
import {
  messages,
  loadMessages,
  sendMessage,
  text,
  currentGroupName,
  displayedMembers,
  loadGroupMembers
} from '../store/interactions';

interface Props {
  dialogs: {
    groupList: boolean
    groupUserList: boolean
    groupLeave: boolean
    groupCreate: boolean
    groupDelete: boolean
    groupInvite: boolean
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
/*tymto osetrime to ten infinity scroll nech sa nedava furt vyssie*/
#chatMessages {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>