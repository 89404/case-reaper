<template>
  <header class="w-full flex justify-between items-center p-4 bg-surface shadow">
    <NuxtLink to="/" class="bg-accent hover:bg-accent2 text-background font-bold py-2 px-6 rounded-lg text-lg transition">Back</NuxtLink>
    <div v-if="user && user.username" class="flex items-center gap-3">
      <img :src="user.avatar" alt="Steam avatar" class="w-10 h-10 rounded-full" />
      <span class="font-bold">{{ user.username }}</span>
      <button @click="logout" class="ml-4 bg-red hover:bg-accent2 text-background font-bold py-1 px-4 rounded transition">Uitloggen</button>
    </div>
    <div v-else>
      <a href="http://localhost:4000/api/auth/steam" class="bg-accent hover:bg-accent2 text-background font-bold py-2 px-6 rounded-lg text-lg transition">Login met Steam</a>
    </div>
  </header>
</template>

<script setup>
import { user, fetchUser } from '~/composables/useAuth.js'
import { onMounted } from 'vue'

onMounted(fetchUser)

async function logout() {
  try {
    await fetch('http://localhost:4000/api/auth/logout', { credentials: 'include' })
    user.value = null
    window.location.href = 'http://localhost:3000/'
  } catch (error) {
    console.error('Logout failed:', error)
    user.value = null
    window.location.href = 'http://localhost:3000/'
  }
}
</script>
