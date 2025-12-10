
<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">User is typing:</span>
      </q-card-section>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">{{peekedMessage}}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="close" color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { computed } from "vue";
import { currentlyPeekedUserIndex,typingUsers } from "../../stores/interactions";


const peekedMessage = computed(() => {
  return typingUsers.value[currentlyPeekedUserIndex.value]?.message || "";
});

interface Props { modelValue: boolean }
interface Emits { (e: 'update:modelValue', value: boolean): void }

defineProps<Props>()
const emit = defineEmits<Emits>()

function closeDialog() {
  emit('update:modelValue', false)
}
</script>

