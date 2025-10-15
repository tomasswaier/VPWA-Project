// import {Notify} from 'quasar'
import {ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])
const text = ref('');
const confirmGroupLeave = ref(false);
const displayGroupList = ref(false);
const maximizedToggle = ref(true);

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
          displayGroupList, maximizedToggle
    }
