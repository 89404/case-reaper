<template>
  <div class="min-h-screen bg-background text-primary">
    <div class="max-w-6xl mx-auto py-10 px-4">
      <h1 class="text-5xl font-bold mb-8 text-center">Case Battles</h1>
      
      <!-- Authentication Required -->
      <div v-if="!user" class="text-center">
        <div class="bg-surface p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 class="text-2xl font-bold mb-4">Login Required</h2>
          <p class="text-secondary mb-6">You need to login with Steam to participate in case battles.</p>
          <NuxtLink to="/login" class="bg-accent hover:bg-accent2 text-background font-bold py-3 px-6 rounded-lg transition">
            Login with Steam
          </NuxtLink>
        </div>
      </div>
      
      <!-- Battle Interface -->
      <div v-else>
        <!-- Pre-Battle State -->
        <div v-if="!battleStarted" class="text-center">
          <div class="bg-surface p-8 rounded-lg shadow-lg max-w-md mx-auto mb-8">
            <div class="flex items-center justify-center mb-4">
              <img :src="user.avatar" :alt="user.username" class="w-16 h-16 rounded-full mr-4" />
              <div>
                <div class="font-bold text-xl">{{ user.username }}</div>
                <div class="text-secondary">Ready to battle!</div>
              </div>
            </div>
            <button 
              @click="joinBattle" 
              :disabled="waiting || !isConnected"
              class="bg-accent hover:bg-accent2 disabled:bg-gray-500 text-background font-bold py-4 px-8 rounded-lg text-xl transition w-full"
            >
              {{ waiting ? 'Finding Opponent...' : 'Join Battle' }}
            </button>
            <div v-if="waiting" class="mt-4 text-secondary animate-pulse">
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                Waiting for another player...
              </div>
            </div>
            <div v-if="!isConnected" class="mt-4 text-red-400">
              Connection lost. Reconnecting...
            </div>
          </div>
          
          <!-- Battle Rules -->
          <div class="bg-surface p-6 rounded-lg max-w-2xl mx-auto">
            <h3 class="text-xl font-bold mb-4">How Case Battles Work</h3>
            <ul class="text-secondary space-y-2">
              <li>• Each player opens 5 random cases</li>
              <li>• The player with the highest total value wins</li>
              <li>• All items are added to your inventory</li>
              <li>• Winner gets bragging rights on the leaderboard!</li>
            </ul>
          </div>
        </div>
        
        <!-- Battle in Progress -->
        <div v-else>
          <!-- Round Animation -->
          <div v-if="showRoundAnimation && currentRoundData && battle" class="mb-8">
            <BattleCaseAnimation 
              :skins="skins"
              :player1Name="battle.players[0].username"
              :player2Name="battle.players[1].username"
              :currentRound="currentRoundData.round"
              :maxRounds="currentRoundData.maxRounds"
              :player1Item="getCurrentRoundItem(0)"
              :player2Item="getCurrentRoundItem(1)"
              :showResults="showRoundResults"
              :player1Result="getCurrentRoundItem(0)"
              :player2Result="getCurrentRoundItem(1)"
              @done="onRoundAnimationDone"
            />
          </div>

          <!-- Battle Progress -->
          <div v-if="!showRoundAnimation" class="text-center mb-6">
            <h2 class="text-3xl font-bold mb-2">Battle in Progress!</h2>
            <div class="text-secondary mt-2">
              Round {{ battle?.currentRound || 0 }}/{{ battle?.maxRounds || 5 }}
            </div>
          </div>
          
          <!-- Player Headers -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div v-for="(player, index) in battle.players" :key="player.userId" 
                 class="bg-surface p-4 rounded-lg shadow-lg text-center"
                 :class="{ 'ring-2 ring-accent': battle.winner && battle.winner.userId === player.userId }">
              <div class="flex items-center justify-center mb-2">
                <img :src="player.avatar" :alt="player.username" class="w-12 h-12 rounded-full mr-3" />
                <div>
                  <div class="font-bold text-lg">{{ player.username }}</div>
                  <div class="text-secondary">Player {{ index + 1 }}</div>
                </div>
                <div v-if="battle.winner && battle.winner.userId === player.userId" 
                     class="ml-auto text-accent font-bold text-lg">
                  🏆 WINNER
                </div>
              </div>
              <div class="text-2xl font-bold text-green-400">€{{ player.totalValue?.toFixed(2) || '0.00' }}</div>
            </div>
          </div>

          <!-- 5 Vertical Cases -->
          <div class="flex flex-col items-center space-y-6">
            <div v-for="roundIndex in 5" :key="roundIndex" 
                 class="w-full max-w-4xl bg-surface rounded-lg shadow-lg p-6">
              <div class="text-center mb-4">
                <h3 class="text-xl font-bold">Round {{ roundIndex }}</h3>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div v-for="(player, playerIndex) in battle.players" :key="player.userId"
                     class="bg-background rounded-lg p-4">
                  <div class="text-center mb-3">
                    <div class="font-medium">{{ player.username }}</div>
                  </div>
                  
                  <div v-if="player.rounds && player.rounds[roundIndex - 1]?.item" 
                       class="flex items-center justify-between p-3 rounded"
                       :class="getRarityClass(player.rounds[roundIndex - 1].item.rarity)">
                    <div class="flex items-center">
                      <img :src="player.rounds[roundIndex - 1].item.image" 
                           :alt="player.rounds[roundIndex - 1].item.name" 
                           class="w-12 h-12 mr-3" />
                      <div>
                        <div class="font-medium">{{ player.rounds[roundIndex - 1].item.name }}</div>
                        <div class="text-sm text-secondary">{{ player.rounds[roundIndex - 1].item.rarity }}</div>
                      </div>
                    </div>
                    <span class="text-green-400 font-bold text-lg">
                      €{{ player.rounds[roundIndex - 1].value?.toFixed(2) || '0.00' }}
                    </span>
                  </div>
                  
                  <div v-else class="text-center text-secondary italic p-8">
                    <img src="/cases/test.png" alt="Unopened Case" class="w-16 h-16 mx-auto mb-2 rounded" />
                    <div>Waiting for case...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Battle Result -->
          <div v-if="battle.winner" class="mt-8 text-center">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg p-6 max-w-md mx-auto">
              <h3 class="text-2xl font-bold mb-2">🏆 Battle Complete!</h3>
              <p class="text-xl mb-2">
                <strong>{{ battle.winner.username }}</strong> wins with 
                <span class="font-bold">${{ battle.winner.totalValue?.toFixed(2) || battle.winner.total?.toFixed(2) }}</span>!
              </p>
              <p class="text-lg font-semibold">
                🎁 Winner takes ALL {{ battle.allItems?.length || 0 }} items!
              </p>
              <p class="text-sm mt-2 opacity-80">
                Total prize value: ${{ battle.allItems?.reduce((sum, item) => sum + item.price, 0).toFixed(2) || '0.00' }}
              </p>
              <button @click="resetBattle" class="bg-accent hover:bg-accent2 text-background font-bold py-3 px-6 rounded-lg transition mt-4">
                Start New Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSocket } from '~/composables/useSocket'
import BattleCaseAnimation from '~/components/BattleCaseAnimation.vue'
import useCaseContents from '~/composables/useCaseContents'

const { socket, isConnected } = useSocket()
const { user, fetchUser } = useAuth()
const { skins, fetchCaseContents } = useCaseContents()
const waiting = ref(false)
const battleStarted = ref(false)
const battle = ref({ players: [] })
const error = ref(null)
const showRoundAnimation = ref(false)
const showRoundResults = ref(false)
const currentRoundData = ref(null)
const caseId = ref('test') // Changed default case ID for battles

// Fetch user data on mount
onMounted(async () => {
  await fetchUser()
  await fetchCaseContents(caseId.value) // Load case contents for animations
  setupSocketListeners()
})

function setupSocketListeners() {
  socket.on('waiting', () => {
    waiting.value = true
    error.value = null
  })
  
  socket.on('battleStarted', (data) => {
    console.log('Battle started:', data)
    battleStarted.value = true
    battle.value = data
    waiting.value = false
    error.value = null
  })
  
  socket.on('roundStarting', (data) => {
      console.log(`Round ${data.round}/${data.maxRounds} starting...`)
      currentRoundData.value = data
      showRoundAnimation.value = true
    })

    socket.on('roundResult', (data) => {
      battle.value = data.battle
      console.log(`Round ${data.round} completed:`, data.battle)
      // Hide animation after showing results
      setTimeout(() => {
        showRoundAnimation.value = false
      }, 3000)
    })
  
  socket.on('battleEnd', (data) => {
    console.log('Battle ended:', data)
    console.log('Winner data:', data.winner)
    battle.value = data
    waiting.value = false
    
    // Play victory sound
    if (data.winner) {
      try {
        const audio = new Audio('/sounds/case_battle_win.mp3')
        audio.volume = 0.9
        audio.play().catch(err => console.error('Failed to play victory sound:', err))
      } catch (error) {
        console.error('Error creating victory sound:', error)
      }
    }
  })
  
  socket.on('error', (err) => {
    console.error('Battle error:', err)
    error.value = err
    waiting.value = false
    battleStarted.value = false
  })
}

function joinBattle() {
  if (!user.value) {
    error.value = 'Please login first'
    return
  }
  
  if (!isConnected.value) {
    error.value = 'Connection lost. Please refresh the page.'
    return
  }
  
  waiting.value = true
  error.value = null
  
  socket.emit('joinBattle', {
    userId: user.value._id,
    username: user.value.username,
    avatar: user.value.avatar
  })
}

function resetBattle() {
  battleStarted.value = false
  battle.value = { players: [] }
  waiting.value = false
  error.value = null
}

function getRarityClass(rarity) {
  const rarityClasses = {
    'mil-spec': 'border-l-4 border-blue-400',
    'restricted': 'border-l-4 border-purple-400',
    'classified': 'border-l-4 border-pink-400',
    'covert': 'border-l-4 border-red-400',
    'knife': 'border-l-4 border-yellow-400'
  }
  return rarityClasses[rarity] || 'border-l-4 border-gray-400'
}

function getCurrentRoundItem(playerIndex) {
  if (!battle.value?.players?.[playerIndex]?.rounds) return null
  const currentRound = currentRoundData.value?.round - 1
  if (currentRound < 0) return null
  return battle.value.players[playerIndex].rounds[currentRound]?.item || null
}

function onRoundAnimationDone() {
  showRoundResults.value = true
  // Hide results after 3 seconds
  setTimeout(() => {
    showRoundAnimation.value = false
    showRoundResults.value = false
  }, 3000)
}

// Cleanup on unmount
onUnmounted(() => {
  if (waiting.value) {
    socket.emit('leaveBattle')
  }
})
</script>