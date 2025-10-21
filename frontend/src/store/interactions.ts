// import {Notify} from 'quasar'
import {reactive, ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])
const text = ref('');

// skupinové konštanty
const currentGroupName = ref('Trumans Group');
const displayedMembers = ref<Array<{name : string, avatar : string}>>([]);
export interface Dialogs {
  groupLeave: boolean
  groupList: boolean
  groupCreate: boolean
}
const dialogs: Dialogs = reactive({
  groupLeave : false,
  groupList : false,
  groupCreate : false,
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
      console.log('LEAVING');
      dialogs.groupLeave = true
      break;
    case "/invite":
      break;
    case "/list":
      resetGroupMembers();
      dialogs.groupList = true
      break;
    case "/join":
      dialogs.groupCreate = true
      break;
    default:
      console.log('Message sent:', text.value)
      break;
    }
    text.value = ''
  }
}


export {
      messages, loadMessages, sendMessage, text, dialogs, currentGroupName,
          displayedMembers, loadGroupMembers, resetGroupMembers
    }
