<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">{{modelMessage}}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="No" color="primary" @click="closeDialog" />
        <q-btn flat label="Yes" color="primary"  @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  modelMessage: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function closeDialog() {
  emit('update:modelValue', false)
}

</script>
