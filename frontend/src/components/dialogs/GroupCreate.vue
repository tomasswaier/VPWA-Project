<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent>
    <q-card>
      <q-card-section class="row items-center">

        <q-form
          @submit="dummyFunction"
          @reset="dummyFunction"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="name"
            label="Group name *"
            hint="Name and surname"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="caption"
            label="Caption"
            :rules="[ val => val && val.length > 0 || 'Please type something']"
            lazy-rules
          />

          <q-toggle v-model="isPrivate" label="I wish for chatroom to be private" />

        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="No" color="primary" @click="closeDialog" />
        <q-btn flat label="Submit" color="primary"  @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
  import {ref} from 'vue';
  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  function closeDialog() {
    emit('update:modelValue', false)
  }
  function dummyFunction(){
  }
  const name= ref('');
  const caption= ref('');
  const isPrivate= ref(true);

</script>

