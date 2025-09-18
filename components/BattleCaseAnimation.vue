<template>
  <div class="w-full flex flex-col items-center space-y-6">
    <!-- Round Info -->
    <div class="text-white text-xl font-bold mb-4">
      Round {{ currentRound }}/{{ maxRounds }}
    </div>
    
    <!-- Case Animation Container -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      <!-- Player 1 Case -->
      <div class="flex flex-col items-center">
        <div class="text-white text-lg mb-4 font-semibold">{{ player1Name }}</div>
        <div class="relative">
          <!-- Case Image -->
          <div v-if="!player1Revealed" class="case-container animate-pulse">
            <img src="/cases/test.png" alt="Case" class="w-48 h-48 object-contain" />
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse"></div>
          </div>
          
          <!-- Revealed Item -->
          <div v-else class="revealed-item" :class="rarityClass(player1Result?.rarity)">
            <img :src="player1Result?.image" :alt="player1Result?.name" class="w-48 h-48 object-contain" :class="getGlowClass(player1Result?.rarity)" />
            <div class="mt-2 text-center">
              <div class="text-white font-medium">{{ player1Result?.name }}</div>
              <div class="text-green-400 font-bold">${{ player1Result?.price?.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Player 2 Case -->
      <div class="flex flex-col items-center">
        <div class="text-white text-lg mb-4 font-semibold">{{ player2Name }}</div>
        <div class="relative">
          <!-- Case Image -->
          <div v-if="!player2Revealed" class="case-container animate-pulse">
            <img src="/cases/test.png" alt="Case" class="w-48 h-48 object-contain" />
            <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg animate-pulse"></div>
          </div>
          
          <!-- Revealed Item -->
          <div v-else class="revealed-item" :class="rarityClass(player2Result?.rarity)">
            <img :src="player2Result?.image" :alt="player2Result?.name" class="w-48 h-48 object-contain" :class="getGlowClass(player2Result?.rarity)" />
            <div class="mt-2 text-center">
              <div class="text-white font-medium">{{ player2Result?.name }}</div>
              <div class="text-green-400 font-bold">${{ player2Result?.price?.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Battle Results Summary -->
    <div v-if="showResults" class="mt-8 w-full animate-fade-in">
      <div class="text-white text-xl mb-4 text-center font-semibold">Round Results</div>
      

      
      <div class="flex justify-center gap-8">
        <!-- Player 1 Summary -->
        <div class="bg-gray-800 rounded-lg p-4 text-center border-2" :class="player1Result?.price > player2Result?.price ? 'border-green-500 shadow-lg shadow-green-500/50' : 'border-gray-600'">
          <div class="text-white font-semibold mb-2">{{ player1Name }}</div>
          <div class="text-green-400 font-bold text-lg">${{ player1Result?.price?.toFixed(2) }}</div>
          <div v-if="player1Result?.price > player2Result?.price" class="text-green-400 text-sm mt-1 font-bold">🏆 WINNER!</div>
        </div>
        
        <!-- VS Divider -->
        <div class="flex items-center">
          <div class="text-white text-2xl font-bold">VS</div>
        </div>
        
        <!-- Player 2 Summary -->
        <div class="bg-gray-800 rounded-lg p-4 text-center border-2" :class="player2Result?.price > player1Result?.price ? 'border-green-500 shadow-lg shadow-green-500/50' : 'border-gray-600'">
          <div class="text-white font-semibold mb-2">{{ player2Name }}</div>
          <div class="text-green-400 font-bold text-lg">${{ player2Result?.price?.toFixed(2) }}</div>
          <div v-if="player2Result?.price > player1Result?.price" class="text-green-400 text-sm mt-1 font-bold">🏆 WINNER!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  skins: { type: Array, required: true },
  player1Name: { type: String, required: true },
  player2Name: { type: String, required: true },
  currentRound: { type: Number, required: true },
  maxRounds: { type: Number, required: true },
  player1Item: { type: Object, default: null },
  player2Item: { type: Object, default: null },
  showResults: { type: Boolean, default: false },
  player1Result: { type: Object, default: null },
  player2Result: { type: Object, default: null }
})

// Component props loaded

const emit = defineEmits(['done'])

const player1Revealed = ref(false)
const player2Revealed = ref(false)
const showResults = ref(false)
const player1Result = ref(null)
const player2Result = ref(null)

// Odds per rarity
const odds = [
  { rarity: 'mil-spec', chance: 79.97 },
  { rarity: 'restricted', chance: 15.98 },
  { rarity: 'classified', chance: 3.2 },
  { rarity: 'covert', chance: 0.64 },
  { rarity: 'knife', chance: 0.26 },
]

function getRandomRarity() {
  const roll = Math.random() * 100
  let acc = 0
  for (const o of odds) {
    acc += o.chance
    if (roll < acc) return o.rarity
  }
  return 'mil-spec'
}

function getRandomSkinByRarity(rarity) {
  const pool = props.skins.filter(s => s.rarity === rarity)
  if (pool.length === 0) return props.skins[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

function playOpenSound() {
  try {
    const audio = new Audio('/sounds/case_open.mp3')
    audio.volume = 0.7
    audio.play().catch(err => console.error('Failed to play open sound:', err))
  } catch (error) {
    console.error('Error creating open sound:', error)
  }
}

function playRewardSound(rarity) {
  try {
    let soundFile = '/sounds/case_reward_milspec.mp3'
    switch (rarity) {
      case 'restricted': soundFile = '/sounds/case_reward_restricted.mp3'; break
      case 'classified': soundFile = '/sounds/case_reward_classified.mp3'; break
      case 'covert': soundFile = '/sounds/case_reward_covert.mp3'; break
      case 'knife': soundFile = '/sounds/case_reward_knife.mp3'; break
    }
    
    const audio = new Audio(soundFile)
    audio.volume = 0.8
    audio.play().catch(err => console.error('Failed to play reward sound:', err))
  } catch (error) {
    console.error('Error creating reward sound:', error)
  }
}



function rarityClass(rarity) {
  switch (rarity) {
    case 'covert': return 'border-red-500 bg-red-500/10'
    case 'classified': return 'border-pink-500 bg-pink-500/10'
    case 'restricted': return 'border-purple-500 bg-purple-500/10'
    case 'mil-spec': return 'border-blue-500 bg-blue-500/10'
    case 'knife': return 'border-yellow-400 bg-yellow-400/10'
    default: return 'border-gray-700 bg-gray-700/10'
  }
}

function getGlowClass(rarity) {
  switch (rarity) {
    case 'covert': return 'drop-shadow-[0_0_20px_rgba(255,70,85,0.8)]'
    case 'classified': return 'drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]'
    case 'restricted': return 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]'
    case 'mil-spec': return 'drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]'
    case 'knife': return 'drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]'
    default: return ''
  }
}

function generateRandomItem() {
  const rarity = getRandomRarity()
  return getRandomSkinByRarity(rarity)
}

function getRoundWinner() {
  if (!player1Result.value || !player2Result.value) return null
  if (player1Result.value.price > player2Result.value.price) {
    return props.player1Name
  } else if (player2Result.value.price > player1Result.value.price) {
    return props.player2Name
  }
  return null // Tie
}

function startAnimation() {
  // Reset animation state
  player1Revealed.value = false
  player2Revealed.value = false
  showResults.value = false
  
  // Play opening sound
  playOpenSound()
  
  // Use passed items or generate random ones
  player1Result.value = props.player1Item || generateRandomItem()
  player2Result.value = props.player2Item || generateRandomItem()
  
  // Smoother animation timing - reduced delays
  setTimeout(() => {
    // Reveal both items simultaneously for smoother experience
    player1Revealed.value = true
    player2Revealed.value = true
    
    // Play reward sounds with slight stagger
    if (player1Result.value?.rarity) {
      playRewardSound(player1Result.value.rarity)
    }
    setTimeout(() => {
      if (player2Result.value?.rarity) {
        playRewardSound(player2Result.value.rarity)
      }
    }, 200)
    
    // Show results summary faster
    setTimeout(() => {
      showResults.value = true
      

      
      // Emit done event sooner
      setTimeout(() => {
        emit('done', {
          player1: player1Result.value,
          player2: player2Result.value
        })
      }, 1500)
    }, 600)
  }, 1500)
}

// Watch for changes in player items to restart animation
watch([() => props.player1Item, () => props.player2Item], () => {
  if (props.player1Item || props.player2Item) {
    startAnimation()
  }
}, { immediate: false })

onMounted(() => {
  startAnimation()
})
</script>

<style scoped>
.case-container {
  @apply relative p-4 bg-gray-800 rounded-lg border-2 border-gray-600;
  transition: all 0.3s ease-in-out;
}

.case-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Smooth transitions for item reveals */
.case-container img {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.case-container img:not([src]) {
  opacity: 0;
  transform: scale(0.8);
}

.case-container img[src] {
  opacity: 1;
  transform: scale(1);
}

/* Smooth text transitions */
.case-container .text-white,
.case-container .text-green-400 {
  transition: all 0.3s ease-in-out;
}

/* Results animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .8;
    transform: scale(1.02);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.revealed-item {
  @apply relative p-4 bg-gray-800 rounded-lg border-2 transition-all duration-500;
  animation: reveal 0.5s ease-out;
}

@keyframes reveal {
  0% {
    transform: scale(0.8) rotateY(90deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotateY(45deg);
  }
  100% {
    transform: scale(1) rotateY(0deg);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>