<template>
  <div class="min-h-screen bg-[#181c23] flex items-center justify-center">
    <div class="bg-[#32343a] rounded-2xl p-10 w-[1400px] max-w-full mx-auto mt-8 shadow-lg">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold text-white">Counter-Strike 2 Cases</h1>
        <button @click="selectedCase = null" v-if="selectedCase" class="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 text-lg">← Back</button>
      </div>
      <div class="flex items-center gap-6 mb-6">
        <input v-model="search" placeholder="Search..." class="px-6 py-3 rounded bg-[#23252b] text-white w-80 text-lg focus:outline-none" />
        <button class="bg-yellow-400 text-black px-6 py-3 rounded font-semibold cursor-default text-lg">Cases</button>
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="!selectedCase">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div v-for="caseItem in filteredCases" :key="caseItem._id" class="bg-[#23252b] rounded-lg p-6 flex flex-col items-center hover:bg-[#282a31] transition cursor-pointer shadow-md" @click="selectCase(caseItem)">
              <img :src="caseItem.image" :alt="caseItem.name" class="w-32 h-28 object-contain mb-3" />
              <div class="font-semibold text-white text-center text-lg">{{ caseItem.name }}</div>
              <div class="text-green-400 font-bold text-lg">{{ caseItem.price.toFixed(2) }} €</div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="flex items-center gap-6 mb-6">
            <img :src="selectedCase.image" :alt="selectedCase.name" class="w-32 h-28 object-contain" />
            <div>
              <h2 class="text-3xl font-bold text-white">{{ selectedCase.name }}</h2>
              <div class="text-green-400 font-bold text-xl">{{ selectedCase.price.toFixed(2) }} €</div>
            </div>
            <button @click="openCase" :disabled="rolling"
              class="ml-auto px-12 py-5 text-2xl font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed"
              :class="resultSkin ? 'bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400/50' : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400/50'">
              Open Case
            </button>
          </div>
          <div v-if="showingCase" class="flex flex-col items-center mb-8">
            <div class="case-shake-container">
              <img :src="selectedCase.image" :alt="selectedCase.name" class="w-48 h-42 object-contain" :class="caseAnimationClass" />
            </div>
          </div>
          <div v-if="rolling" class="mb-8">
            <CaseRollAnimation :skins="skins" :customOdds="customOdds" @done="onRollDone" />
          </div>
          <CaseResult v-if="resultSkin" :skin="resultSkin" :onAgain="openCase" :onClose="closeResult" />
          <div v-if="!resultSkin" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 mt-6">
            <div v-for="skin in sortedSkins" :key="skin._id" class="bg-[#181c23] rounded-lg p-3 flex flex-col items-center border-2 mb-3" :class="rarityClass(skin.rarity)">
              <img :src="skin.image" :alt="skin.name" class="w-24 h-20 object-contain mb-2" />
              <div class="text-sm text-white text-center">{{ skin.name }}</div>
              <div class="font-bold text-sm text-green-400">{{ skin.price ? skin.price.toFixed(2) + ' €' : '' }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCases } from '~/composables/useCases'
import { useCaseContents } from '~/composables/useCaseContents'
import CaseRollAnimation from '~/components/CaseRollAnimation.vue'
import CaseResult from '~/components/CaseResult.vue'

const { apiCall } = useApi()

const search = ref('')
const selectedCase = ref(null)
const rolling = ref(false)
const showingCase = ref(false)
const resultSkin = ref(null)
const caseAnimationPhase = ref(0) // 0: shake, 1: opening
const { cases, fetchCases } = useCases()
const { skins, fetchCaseContents } = useCaseContents()

onMounted(fetchCases)

const filteredCases = computed(() => {
  return cases.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const rarityOrder = ['mil-spec', 'restricted', 'classified', 'covert', 'knife']
const sortedSkins = computed(() => {
  return [...skins.value].sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity))
})

// Custom odds for Test Case - higher chances for rare items
const customOdds = computed(() => {
  if (selectedCase.value && selectedCase.value.name === 'Test Case') {
    return [
      { rarity: 'mil-spec', chance: 40.0 },
      { rarity: 'restricted', chance: 30.0 },
      { rarity: 'classified', chance: 20.0 },
      { rarity: 'covert', chance: 8.0 },
      { rarity: 'knife', chance: 2.0 },
    ]
  }
  return null // Use default odds for other cases
})

const caseAnimationClass = computed(() => {
  switch (caseAnimationPhase.value) {
    case 0: return 'case-shake'
    case 1: return 'case-opening'
    default: return ''
  }
})

function selectCase(caseItem) {
  selectedCase.value = caseItem
  fetchCaseContents(caseItem._id)
  resultSkin.value = null
}

function openCase() {
  rolling.value = false
  showingCase.value = false
  resultSkin.value = null
  caseAnimationPhase.value = 0
  
  // Start with case animation
  setTimeout(() => {
    playOpenSound()
    showingCase.value = true
    caseAnimationPhase.value = 0 // Start shaking
    
    // After shake, show opening animation
    setTimeout(() => {
      caseAnimationPhase.value = 1 // Opening animation
      
      // After opening animation, start the roll
      setTimeout(() => {
        showingCase.value = false
        rolling.value = true
      }, 800) // 0.8 seconds for opening animation
    }, 1200) // 1.5 seconds for shake animation
  }, 300)
}

function playOpenSound() {
  const audio = new Audio('/sounds/case_open.mp3')
  audio.volume = 0.8
  audio.play()
}

async function onRollDone(wonSkin) {
  rolling.value = false
  
  try {
    // Call the API to actually open the case and get the real result
    const actualWonSkin = await apiCall(`/api/cases/open/${selectedCase.value._id}`)
    
    // Use the actual skin from the server (this ensures fair randomization)
    resultSkin.value = actualWonSkin
    
    // Play reward sound based on rarity
    playRewardSound(actualWonSkin.rarity)
    
    // The API already handles adding to inventory if user is authenticated
    console.log('Case opened successfully:', actualWonSkin)
    
  } catch (error) {
    console.error('Error opening case:', error)
    // Fallback to the visually won skin if API fails
    resultSkin.value = wonSkin
  }
}

function playRewardSound(rarity) {
  let soundFile = '/sounds/case_reward_milspec.mp3' // default
  
  switch (rarity) {
    case 'knife':
      soundFile = '/sounds/case_reward_knife.mp3'
      break
    case 'covert':
      soundFile = '/sounds/case_reward_covert.mp3'
      break
    case 'classified':
      soundFile = '/sounds/case_reward_classified.mp3'
      break
    case 'restricted':
      soundFile = '/sounds/case_reward_restricted.mp3'
      break
    case 'mil-spec':
    default:
      soundFile = '/sounds/case_reward_milspec.mp3'
      break
  }
  
  const audio = new Audio(soundFile)
  audio.volume = 0.6
  audio.play().catch(e => console.log('Could not play reward sound:', e))
}

function closeResult() {
  resultSkin.value = null
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'covert': return 'border-[#ff4655] text-[#ff4655]'
    case 'classified': return 'border-pink-500 text-pink-400'
    case 'restricted': return 'border-purple-500 text-purple-400'
    case 'mil-spec': return 'border-blue-500 text-blue-400'
    case 'knife': return 'border-yellow-400 text-yellow-300'
    default: return 'border-gray-700 text-gray-300'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.case-shake-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.case-shake {
  animation: shake 0.5s ease-in-out infinite alternate;
}

@keyframes shake {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-3px) rotate(-1deg);
  }
  50% {
    transform: translateX(0) rotate(0deg);
  }
  75% {
    transform: translateX(3px) rotate(1deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}

.case-opening {
  animation: caseOpen 0.8s ease-out forwards;
}

@keyframes caseOpen {
  0% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.1) rotate(5deg);
  }
  60% {
    transform: scale(1.05) rotate(-2deg) translateY(-10px);
  }
  100% {
    transform: scale(1.2) rotate(0deg) translateY(-15px);
    filter: brightness(1.3) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
  }
}

body {
  background: #181c23 !important;
}
</style>