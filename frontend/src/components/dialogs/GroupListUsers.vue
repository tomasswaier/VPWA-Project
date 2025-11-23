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
        <div class="text-h5 text-white text-weight-bold">{{ currentGroupName }}</div>
      </q-card-section>

      <q-separator color="white" />

      <q-card-section class="q-pt-md" style="padding: 0;">
        <q-scroll-area style="height: 60vh; width: 100%;">
          <q-infinite-scroll :offset="250" @load="loadGroupMembers">
            <q-list>
              <q-item v-for="(member, index) in displayedMembers" :key="index" class="q-mb-sm">
                <q-item-section avatar>
                  <q-item :class="member.status == 'online' ? 'bg-light-green' : member.status == 'do_not_disturb'?'bg-red':''">
                    <q-item-section >
                      ME
                    </q-item-section>
                  </q-item>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-white text-weight-medium">{{ member.username}}</q-item-label>
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
import { currentGroupName, displayedMembers, loadGroupMembers } from '../../stores/interactions'
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
      if (displayedMembers.value.length === 0) {
        loadGroupMembers(0, () => {});
      }
    }, 100);
  }
});
</script>
