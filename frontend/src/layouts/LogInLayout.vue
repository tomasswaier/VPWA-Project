<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Chat Appus</q-toolbar-title>
        <q-btn to="/" flat dense round icon="home" aria-label="Home" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center bg-accent">
        <q-card style="width: 400px; max-width: 90vw;">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bold text-primary">Login</div>
            <div class="text-subtitle2 text-grey-7">Welcome back!</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin" class="q-gutter-md">
              <q-input
                filled
                v-model="email"
                type="text"
                label="Username"
                hint="Enter your email address"
                lazy-rules
                :rules="[
                  (val:string) => val && val.length > 0 || 'Please enter your username',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                filled
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                label="Password *"
                hint="Enter your password"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

              <div class="q-mt-md">
                <q-btn
                  unelevated
                  type="submit"
                  color="primary"
                  label="Login"
                  class="full-width"
                  size="md"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <div class="text-grey-7">
              Not registered yet?
              <router-link to="/register" class="text-primary text-weight-bold" style="text-decoration: none;">
                Register here!
              </router-link>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { login,ping } from '../stores/interactions';



async function handleLogin() {
  await login(email.value,password.value);
}

const email = ref('');
const password = ref('');
const isPwd = ref(true);

</script>
