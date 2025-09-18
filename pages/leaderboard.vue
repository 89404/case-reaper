<template>
  <div class="min-h-screen bg-background text-primary">
    <div class="max-w-4xl mx-auto py-10 px-4">
      <h1 class="text-5xl font-bold mb-8 text-center">🏆 Leaderboard</h1>
      
      <!-- Tab Navigation -->
      <div class="mb-8 flex justify-center">
        <div class="bg-surface rounded-lg p-1 flex">
          <button 
            @click="tab = 'value'" 
            :class="tab==='value' ? 'bg-accent text-background' : 'text-primary hover:bg-background'"
            class="px-6 py-3 rounded-md font-bold transition"
          >
            💰 Highest Value
          </button>
          <button 
            @click="tab = 'cases'" 
            :class="tab==='cases' ? 'bg-accent text-background' : 'text-primary hover:bg-background'"
            class="px-6 py-3 rounded-md font-bold transition"
          >
            📦 Most Cases
          </button>
          <button 
            @click="tab = 'battles'" 
            :class="tab==='battles' ? 'bg-accent text-background' : 'text-primary hover:bg-background'"
            class="px-6 py-3 rounded-md font-bold transition"
          >
            ⚔️ Battle Wins
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p class="text-secondary">Loading leaderboard...</p>
      </div>
      
      <!-- Value Leaderboard -->
      <div v-else-if="tab==='value'">
        <h2 class="text-3xl font-bold mb-6 text-center">💰 Highest Inventory Value</h2>
        <div class="space-y-3">
          <div v-for="(user, index) in leaderboardValue" :key="user._id" 
               class="bg-surface p-4 rounded-lg shadow-lg flex items-center justify-between"
               :class="getRankClass(index)">
            <div class="flex items-center">
              <div class="text-2xl font-bold mr-4 w-8">
                {{ getRankEmoji(index) }}
              </div>
              <img :src="user.avatar" :alt="user.username" class="w-12 h-12 rounded-full mr-4" />
              <div>
                <div class="font-bold text-lg">{{ user.username }}</div>
                <div class="text-secondary">{{ user.casesOpened || 0 }} cases opened</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-green-400">€{{ user.totalValue.toFixed(2) }}</div>
              <div class="text-secondary text-sm">Total Value</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cases Leaderboard -->
      <div v-else-if="tab==='cases'">
        <h2 class="text-3xl font-bold mb-6 text-center">📦 Most Cases Opened</h2>
        <div class="space-y-3">
          <div v-for="(user, index) in leaderboardCases" :key="user._id" 
               class="bg-surface p-4 rounded-lg shadow-lg flex items-center justify-between"
               :class="getRankClass(index)">
            <div class="flex items-center">
              <div class="text-2xl font-bold mr-4 w-8">
                {{ getRankEmoji(index) }}
              </div>
              <img :src="user.avatar" :alt="user.username" class="w-12 h-12 rounded-full mr-4" />
              <div>
                <div class="font-bold text-lg">{{ user.username }}</div>
                <div class="text-secondary">€{{ (user.totalValue || 0).toFixed(2) }} total value</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-accent">{{ user.casesOpened || 0 }}</div>
              <div class="text-secondary text-sm">Cases Opened</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Battle Wins Leaderboard -->
      <div v-else>
        <h2 class="text-3xl font-bold mb-6 text-center">⚔️ Battle Champions</h2>
        <div class="space-y-3">
          <div v-for="(user, index) in leaderboardBattles" :key="user._id" 
               class="bg-surface p-4 rounded-lg shadow-lg flex items-center justify-between"
               :class="getRankClass(index)">
            <div class="flex items-center">
              <div class="text-2xl font-bold mr-4 w-8">
                {{ getRankEmoji(index) }}
              </div>
              <img :src="user.avatar" :alt="user.username" class="w-12 h-12 rounded-full mr-4" />
              <div>
                <div class="font-bold text-lg">{{ user.username }}</div>
                <div class="text-secondary">{{ Math.round((user.battleWins / Math.max(user.battlesPlayed, 1)) * 100) }}% win rate</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-yellow-400">{{ user.battleWins || 0 }}</div>
              <div class="text-secondary text-sm">Battle Wins</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="!loading && getCurrentLeaderboard().length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🏆</div>
        <h3 class="text-2xl font-bold mb-2">No Data Yet</h3>
        <p class="text-secondary">Be the first to appear on the leaderboard!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const tab = ref('value')
const leaderboardValue = ref([])
const leaderboardCases = ref([])
const leaderboardBattles = ref([])
const loading = ref(true)

onMounted(async () => {
  await loadLeaderboards()
})

async function loadLeaderboards() {
  loading.value = true
  try {
    const [valueRes, casesRes, battlesRes] = await Promise.all([
      fetch('http://localhost:4000/api/leaderboard/value', { credentials: 'include' }),
      fetch('http://localhost:4000/api/leaderboard/cases', { credentials: 'include' }),
      fetch('http://localhost:4000/api/leaderboard/battles', { credentials: 'include' })
    ])
    
    leaderboardValue.value = await valueRes.json()
    leaderboardCases.value = await casesRes.json()
    
    // Handle battles endpoint that might not exist yet
    if (battlesRes.ok) {
      leaderboardBattles.value = await battlesRes.json()
    } else {
      // Mock data for now since battles endpoint doesn't exist yet
      leaderboardBattles.value = []
    }
  } catch (error) {
    console.error('Failed to load leaderboards:', error)
  } finally {
    loading.value = false
  }
}

const getCurrentLeaderboard = computed(() => {
  switch (tab.value) {
    case 'value': return leaderboardValue.value
    case 'cases': return leaderboardCases.value
    case 'battles': return leaderboardBattles.value
    default: return []
  }
})

function getRankEmoji(index) {
  switch (index) {
    case 0: return '🥇'
    case 1: return '🥈'
    case 2: return '🥉'
    default: return `#${index + 1}`
  }
}

function getRankClass(index) {
  switch (index) {
    case 0: return 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20'
    case 1: return 'ring-2 ring-gray-400 bg-gradient-to-r from-gray-900/20 to-gray-800/20'
    case 2: return 'ring-2 ring-orange-400 bg-gradient-to-r from-orange-900/20 to-orange-800/20'
    default: return 'hover:bg-gray-800/50 transition-colors'
  }
}
</script>