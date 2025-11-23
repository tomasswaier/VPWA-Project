<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent>
    <q-card>
      <q-card-section class="row items-center">

        <q-form
          @submit="handleSubmit"
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
        <q-btn flat label="Submit" color="primary" @click="handleSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
  import {ref} from 'vue';
  import {Notify} from 'quasar';
  import {api} from 'src/boot/axios';
  import type {AxiosError} from 'axios';
  import {loadUserGroups} from 'src/stores/interactions';
  
  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  function closeDialog() {
    name.value = '';
    caption.value = '';
    isPrivate.value = true;
    emit('update:modelValue', false)
  }
  
  async function handleSubmit() {
    if (!name.value || name.value.trim() === '') {
      return;
    }

    try {
      const response = await api.post("/groups/join-or-create", {
        name: name.value,
        isPrivate: isPrivate.value,
        description: caption.value || null
      });

      Notify.create({
        message: response.data.message,
        color: "positive",
        icon: "check_circle",
        position: "top",
        timeout: 2000
      });

      await loadUserGroups();
      closeDialog();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      Notify.create({
        message: error.response?.data?.message || "Failed to create group",
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 2000
      });
    }
  }
  
  function dummyFunction(){
  }
  const name= ref('');
  const caption= ref('');
  const isPrivate= ref(true);

</script>