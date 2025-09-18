<template>
  <div class="min-h-screen bg-background text-primary">
    <div class="max-w-3xl mx-auto py-10">
      <h1 class="text-4xl font-bold mb-8">Mijn Inventory</h1>
      <div v-if="!inventory.length" class="text-secondary">Je hebt nog geen items.</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="item in inventory" :key="item._id" class="bg-surface rounded-lg p-4 flex flex-col items-center">
          <img :src="item.image" :alt="item.name" class="w-16 h-16 mb-2" />
          <div class="font-bold mb-1">{{ item.name }}</div>
          <div class="text-green">€{{ item.price.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const inventory = ref([])

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/inventory', {
      credentials: 'include'
    })
    if (res.ok) {
      inventory.value = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
  }
})
</script>