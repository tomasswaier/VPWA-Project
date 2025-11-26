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
        <div class="text-h5 text-white text-weight-bold">Your Invitations</div>
      </q-card-section>

      <q-separator color="white" />

      <q-card-section class="q-pt-md" style="padding: 0;">
        <q-scroll-area style="height: 60vh; width: 100%;">
          <q-list class="container">
            <q-item v-if="invitations.length === 0">
              <q-item-section>
                <q-item-label class="text-white text-center">No pending invitations</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-for="(invitation, index) in invitations" :key="index">
              <q-item-section>
                <q-item-label class="text-white text-weight-medium">{{ invitation.title}}</q-item-label>
                <q-item-label caption>{{ invitation.caption }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn 
                    dense 
                    round 
                    icon="check" 
                    class="text-white bg-positive" 
                    aria-label="Accept invitation"
                    @click="handleAcceptInvitation(invitation.id)"
                  />
                  <q-btn 
                    dense 
                    round 
                    icon="close" 
                    class="text-white bg-negative" 
                    aria-label="Decline invitation"
                    @click="handleDeclineInvitation(invitation.id)"
                  />
                </div>
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
import { invitations, loadInvitations, acceptInvitation, declineInvitation } from '../../stores/interactions'

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

async function handleAcceptInvitation(groupId: string | undefined) {
  if (!groupId) return;
  await acceptInvitation(groupId);
  invitations.value = invitations.value.filter(inv => inv.id !== groupId);
}

async function handleDeclineInvitation(groupId: string | undefined) {
  if (!groupId) return;
  await declineInvitation(groupId);
  invitations.value = invitations.value.filter(inv => inv.id !== groupId);
}

watch(()=>props.modelValue, (isOpen) => {
  if (isOpen) {
    invitations.value = []
    void loadInvitations(0, () => {})
  }
})
</script>