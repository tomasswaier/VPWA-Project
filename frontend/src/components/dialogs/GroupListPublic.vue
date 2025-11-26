<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-primary text-white" style="min-width: 500px;">
      <q-bar>
        <q-space />
        <q-btn dense flat icon="close" @click="closeDialog">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>
      
      <q-card-section class="text-center">
        <div class="text-h5 text-white text-weight-bold">Public Groups</div>
      </q-card-section>

      <q-separator color="white" />

      <q-card-section class="q-pt-md" style="padding: 0;">
        <q-scroll-area style="height: 60vh; width: 100%;">
          <q-list class="container">
            <q-item v-for="(group, index) in publicGroups" :key="index">
              <q-item-section>
                <q-item-label class="text-white text-weight-medium">{{ group.title}}</q-item-label>
                <q-item-label caption>{{ group.caption }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn 
                  dense 
                  round 
                  icon="add" 
                  class="text-white" 
                  aria-label="Join group"
                  @click="handleJoinGroup(group.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { publicGroups, loadPublicGroups, joinPublicGroup } from '../../stores/interactions'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function closeDialog() {
  emit('update:modelValue', false)
}

async function handleJoinGroup(groupId: string | undefined) {
  if (!groupId) return;
  await joinPublicGroup(groupId);
  closeDialog();
}

watch(()=>props.modelValue, (isOpen) => {
  if (isOpen) {
    publicGroups.value = []
    void loadPublicGroups(0, () => {})
  }
})
</script>