// import {Notify} from 'quasar'
import {reactive, ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])
const text = ref('');

// skupinové konštanty
const currentGroupName = ref('Trumans Group');
const displayedMembers = ref<Array<{name : string, avatar : string}>>([]);
const publicGroups = ref<Array<{name : string, caption : string}>>([]);

export interface Dialogs {
  groupLeave: boolean
  groupList: boolean
  groupCreate: boolean
  groupDelete: boolean
  groupInvite: boolean
  groupUserList: boolean
}
const dialogs: Dialogs = reactive({
  groupLeave : false,
  groupList : false,
  groupCreate : false,
  groupDelete : false,
  groupInvite : false,
  groupUserList : false,
})

// Zoznam base memberov
const baseMemberTemplates = [
  {name : 'Johnka', avatar : 'https://cdn.quasar.dev/img/avatar2.jpg'},
  {
    name : 'Marian Emanual Chornandez Pelko De La Muerto',
    avatar : 'https://cdn.quasar.dev/img/avatar3.jpg'
  },
  {name : 'Tomas Truman', avatar : 'https://cdn.quasar.dev/img/avatar4.jpg'},
];

const baseGroupTemplates = [
  {
    name : 'Anima Group',
    caption : 'here we talk about animals and other fun stuff'
  },
  {name : 'Fun Group XD', caption : 'we have fun here!'},
  {
    name : 'Leauge of legends',
    caption : 'HERE WE TALK ABOUT LEAGUE OF LEGENDS'
  },
  {name : 'GAMING', caption : 'HERE WE TALK ABOUT GAMES!!'},
  {name : 'Fashion', caption : "let's discuss fashion!!"},
];

function loadGroupMembers(index: number, done: () => void): void {
  setTimeout(() => {
    const batchSize = 5;
    const newMembers = [];

    for (let i = 0; i < batchSize; i++) {
      const templateIX =
          (displayedMembers.value.length + i) % baseMemberTemplates.length;
      const template = baseMemberTemplates[templateIX]!;

      // pri kazdom znovunačítaní som pridal číslo, nech vidno, že sú to "nový"
      // členovia skupiny
      newMembers.push({
        name : `${template.name} #${displayedMembers.value.length + i + 1}`,
        avatar : template.avatar
      });
    }

    displayedMembers.value.push(...newMembers);
    done();
  }, 300);
}

function loadPublicGroups(index: number, done: () => void): void {
  setTimeout(() => {
    const batchSize = 10;
    const newGroups = [];

    for (let i = 0; i < batchSize; i++) {
      const templateIX =
          (publicGroups.value.length + i) % baseGroupTemplates.length;
      const template = baseGroupTemplates[templateIX]!;

      newGroups.push({
        name : `${template.name} #${publicGroups.value.length + i + 1}`,
        caption : template.caption
      });
    }

    publicGroups.value.push(...newGroups);
    done();
  }, 300);
}
function resetGroupMembers(): void { displayedMembers.value = []; }

function loadMessages(index: number, done: () => void): void {
  setTimeout(() => {
    messages.value.splice(0, 0, {}, {}, {}, {}, {}, {}, {})
    done()
  }, 100)
}

function sendMessage() {
  const inputText: string = text.value.trim();
  if (inputText) {
    const firstArg: string = inputText.split(' ')[0] as string;
    switch (firstArg) {
    case "/leave":
      leaveGroup();
      break;
    case "/invite":
      inviteGroup();
      break;
    case "/list":
      listGroupUsers();
      break;
    case "/join":
      joinGroup();
      break;
    case "/delete":
      deleteGroup();
      break;
    default:
      console.log('Message sent:', text.value)
      break;
    }
    text.value = ''
  }
}
function listGroupUsers(){
  resetGroupMembers();
  dialogs.groupUserList = true
}

function listGroups(){
  dialogs.groupList = true
}

function joinGroup(){
  dialogs.groupCreate = true
}
function leaveGroup(){
  dialogs.groupLeave = true
}
function deleteGroup(){
  dialogs.groupDelete = true
}

function inviteGroup(){
  dialogs.groupInvite = true
}

export {
      messages, loadMessages, sendMessage, text, dialogs, currentGroupName,
          displayedMembers, leaveGroup, listGroups, deleteGroup, inviteGroup,
          joinGroup, loadGroupMembers, resetGroupMembers, loadPublicGroups,
          publicGroups
    }
