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
            <div class="text-h4 text-weight-bold text-primary">Register</div>
            <div class="text-subtitle2 text-grey-7">Create your account</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister" class="q-gutter-md">
              <q-input
                filled
                v-model="username"
                label="Username *"
                hint="Choose your username"
                lazy-rules
                :rules="[
                  (val:string) => val && val.length > 0 || 'Please enter your username',
                  (val:string) => val && val.length >= 3 || 'Username must be at least 3 characters'
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
                hint="Enter your password (min. 4 characters)"
                lazy-rules
                :rules="[
                  (val:string) => val && val.length > 0 || 'Please enter your password',
                  (val:string) => val && val.length >= 4 || 'Password must be at least 4 characters'
                ]"
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

              <q-input
                filled
                v-model="confirmPassword"
                :type="isConfirmPwd ? 'password' : 'text'"
                label="Confirm Password *"
                hint="Re-enter your password"
                lazy-rules
                :rules="[
                  (val:string) => val && val.length > 0 || 'Please confirm your password',
                  (val:string) => val === password || 'Passwords do not match'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isConfirmPwd = !isConfirmPwd"
                  />
                </template>
              </q-input>

              <div class="q-mt-md">
                <q-btn
                  unelevated
                  type="submit"
                  color="primary"
                  label="Register"
                  class="full-width"
                  size="md"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <div class="text-grey-7">
              Already have an account?
              <router-link to="/login" class="text-primary text-weight-bold" style="text-decoration: none;">
                Login here!
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
import { useRouter } from 'vue-router';
import { register } from '../stores/interactions';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPwd = ref(true);
const isConfirmPwd = ref(true);

async function handleRegister() {
  // Zatiaľ len simulácia registrácie
  console.log('Register attempt:', {
    username: username.value,
    password: password.value
  });
  await register(username.value,password.value,confirmPassword.value);


  // Po úspešnej registrácii presmerovanie na login
  void router.push('/login');
}
</script>
