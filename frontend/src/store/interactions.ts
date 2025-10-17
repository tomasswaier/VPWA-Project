// import {Notify} from 'quasar'
import {ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])
const text = ref('');
const confirmGroupLeave = ref(false);
const displayGroupList = ref(false);
const maximizedToggle = ref(true);


//vsetko pre /list function - meno, def formatu pre members list a vsetci usery 
const currentGroupName = ref('Trumans Group');
const displayedMembers = ref<Array<{name: string, avatar: string}>>([]);
const allGroupMembers = ([
  { name: 'Johnka', avatar: 'https://cdn.quasar.dev/img/avatar2.jpg' },
  { name: 'Marian Emanual Chornandez Pelko De La Muerto', avatar: 'https://cdn.quasar.dev/img/avatar3.jpg' },
  { name: 'Tomas Truman', avatar: 'https://cdn.quasar.dev/img/avatar4.jpg' },
].sort((a, b) => a.name.localeCompare(b.name)));

function loadGroupMembers(index: number, done: () => void): void {
  setTimeout(() => {
    //shows only all members, but the infinity scrolls doesnt work yet
    const newMembers = [];
    for (let i = 0; i < 3; i++) {
      const memberIndex = (displayedMembers.value.length + i ) % allGroupMembers.length;
      newMembers.push(allGroupMembers[memberIndex]!);
    }
    displayedMembers.value.push(...newMembers);
    done();
  }, 300);
}

function resetGroupMembers(): void {
  displayedMembers.value = [];
}


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
      confirmGroupLeave.value = true
      break;
    case "/invite":
      break;
    case "/list":
      displayGroupList.value = true
      break;
    default:
      console.log('Message sent:', text.value)
      break;
    }
    text.value = ''
  }
}

export {
      messages, loadMessages, sendMessage, text, confirmGroupLeave,
          displayGroupList, maximizedToggle, currentGroupName, displayedMembers, loadGroupMembers, resetGroupMembers
    }
