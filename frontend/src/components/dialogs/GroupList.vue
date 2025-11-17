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
      <q-separator color="white" />
      <q-card-section class="q-pt-md" style="padding: 0;">
        <q-scroll-area style="height: 60vh; width: 100%;">
          <q-infinite-scroll :offset="250" @load="loadPublicGroups">
            <q-list>
              <q-item v-for="(group, index) in publicGroups" :key="index" class="q-mb-sm">
                <q-item-section>
                  <q-item-label class="text-white text-weight-medium">{{ group.name }}</q-item-label>
                  <q-item-label caption class="">{{ group.caption}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="white" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { watch } from 'vue'
import {  publicGroups, loadPublicGroups } from '../../stores/interactions'
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
watch(()=>props.modelValue, (isOpen) => {
  if (isOpen) {
    //po otvorení (pop-upu) sa načítajú členovia skupiny
    setTimeout(() => {
      if (publicGroups.value.length === 0) {
        loadPublicGroups(0, () => {});
      }
    }, 100);
  }
});
</script>
