<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
    <div class="bg-surface p-8 rounded-lg shadow-lg flex flex-col items-center">
      <img src="/logo.png" alt="Case Reaper" class="w-32 mb-6" />
      <h1 class="text-3xl font-bold mb-2">Login met Steam</h1>
      <p class="mb-6 text-secondary">Log in met je Steam account om cases te openen en battles te spelen.</p>
      <div v-if="user && user.username">
        <img :src="user.avatar" alt="Steam avatar" class="w-16 h-16 rounded-full mb-2" />
        <div class="font-bold text-xl mb-2">{{ user.username }}</div>
        <button @click="logout" class="bg-red hover:bg-accent2 text-background font-bold py-2 px-6 rounded-lg text-lg transition">Uitloggen</button>
      </div>
      <a
        v-else
        href="http://localhost:4000/api/auth/steam"
        class="bg-accent hover:bg-accent2 text-background font-bold py-3 px-8 rounded-lg text-xl transition"
      >
        Login met Steam
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { user, fetchUser } from '~/composables/useAuth.js'

onMounted(fetchUser)

async function logout() {
  try {
    await fetch('http://localhost:4000/api/auth/logout', {
      credentials: 'include'
    })
    user.value = null
    window.location.reload()
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}
</script>