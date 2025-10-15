// import {Notify} from 'quasar'
import {ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])
const text = ref('');
const confirmGroupLeave = ref(false);

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
      // Notify.create('Danger, Will Robinson! Danger!');
      confirmGroupLeave.value = true
      // make a thing which forces user to confirm his choice
      break;
    case "/invite":
      console.log('inviting');
      // make a thing which forces user to confirm his choice
      break;
    default:
      console.log('Message sent:', text.value)
      break;
    }
    text.value = ''
  }
}

export {
      messages, loadMessages, sendMessage, text, confirmGroupLeave
    }
