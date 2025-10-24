<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent>
    <q-card>
      <q-card-section class="row items-center">

        <q-form
          @submit="handleInvite"
          @reset="dummyFunction"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="name"
            label="UserName"
            hint="Name of person to invite"
            lazy-rules
            :rules="[ (val: string) => val && val.length > 0 || 'Please type something']"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeDialog" />
        <q-btn flat label="Invite" color="primary"  @click="handleInvite" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
  import {ref} from 'vue';
  import {Notify} from 'quasar';
  
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
    emit('update:modelValue', false)
  }
  
  function handleInvite() {
    if (name.value.trim()) {
      Notify.create({
        message: `Invitation sent to ${name.value}`,color: 'positive',icon: 'mail',position: 'top',timeout: 2500});
      closeDialog();
    }
  }
  
  function dummyFunction(){
  }
  const name= ref('');

</script>