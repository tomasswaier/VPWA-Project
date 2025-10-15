import {ref} from 'vue'

const messages = ref<Record<string, unknown>[]>([ {}, {}, {} ])

function loadMessages(index: number, done: () => void): void {
  setTimeout(() => {
    messages.value.splice(0, 0, {}, {}, {}, {}, {}, {}, {})
    done()
  }, 100)
}

export {messages, loadMessages}
