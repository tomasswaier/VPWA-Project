<template>
<q-item :class="{'bg-primary text-white':isPrivate}" class="q-pa-md">
  <div class="row items-center full-width no-wrap">
    <div class="col" clickable tag="a" :href="link">
      <q-item-section class="ellipsis">
        <q-item-label class="ellipsis">{{ title }}</q-item-label>
        <q-item-label caption class="ellipsis">{{ caption }}</q-item-label>
      </q-item-section>
    </div>

    <div class="col-auto q-pl-md">
      <q-btn-dropdown color="primary" @click.stop dense>
        <q-list>
          <q-item clickable v-close-popup>
            <q-item-section>
              <q-item-label>Leave Server</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup>
            <q-item-section>
              <q-item-label>Invite to</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup>
            <q-item-section>
              <q-item-label>Some Other option</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</q-item>
</template>

<script setup lang="ts">
export interface GroupLinkProps {
  title: string;
  caption?: string;
  link?: string;
  isPrivate?:boolean;
}

withDefaults(defineProps<GroupLinkProps>(), {
  caption: '',
  link: '#',
  isPrivate:false
});
</script>
