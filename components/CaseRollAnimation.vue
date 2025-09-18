<template>
  <div class="w-full flex flex-col items-center">
    <div class="relative w-[900px] h-[180px] border-4 border-gray-600 rounded-lg overflow-hidden bg-gray-900 transition-all duration-1000" :class="openingClass">
      <div class="absolute top-0 left-1/2 w-1 h-full bg-yellow-300 z-10" style="transform: translateX(-0.5px);"></div>
      <div class="flex h-full" :style="{ transform: `translateX(-${offset}px)` }" ref="strip">
        <div v-for="(skin, i) in allSkins" :key="i" class="w-[180px] h-[180px] flex items-center justify-center flex-shrink-0 relative"
          :class="i === winnerIndex ? rarityClass(skin.rarity) : ''">
          <img :src="skin.image" :alt="skin.name" class="w-full h-full object-contain transition-all duration-300"
            :class="getGlowClass(skin.rarity, i === winnerIndex && animationComplete)" />
          <!-- Separator line between items -->
          <div v-if="i < allSkins.length - 1" class="absolute right-0 top-2 bottom-2 w-px bg-gray-600 z-5"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
const props = defineProps({
  skins: { type: Array, required: true },
  customOdds: { type: Array, default: null }
})
const emit = defineEmits(['done'])

const allSkins = ref([])
const offset = ref(0)
const itemWidth = 180
const visibleCount = 5
const totalItems = 100 // Total items in the strip
const totalDuration = 6000 // ms
const winnerIndex = ref(0)
const centerPosition = ref(0) // Position where the center line is
const animationComplete = ref(false)
const isOpening = ref(false)
let lastTick = 0
let animationId = null

// Computed property for opening animation
const openingClass = computed(() => {
  return isOpening.value ? 'case-opening-horizontal' : ''
})

// Default odds per rarity
const defaultOdds = [
  { rarity: 'mil-spec', chance: 79.97 },
  { rarity: 'restricted', chance: 15.98 },
  { rarity: 'classified', chance: 3.2 },
  { rarity: 'covert', chance: 0.64 },
  { rarity: 'knife', chance: 0.20 },
  { rarity: 'gold', chance: 0.06 },
]

// Use custom odds if provided, otherwise use default
const odds = props.customOdds || defaultOdds

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

function playTick() {
  const audio = new Audio('/sounds/case_tick.mp3')
  audio.volume = 0.25
  audio.play()
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'covert': return 'border-[#ff4655]'
    case 'classified': return 'border-pink-500'
    case 'restricted': return 'border-purple-500'
    case 'mil-spec': return 'border-blue-500'
    case 'knife': return 'border-yellow-400'
    case 'gold': return 'border-yellow-500'
    case 'glove': return 'border-orange-500'
    default: return 'border-gray-700'
  }
}

function getGlowClass(rarity, isWinner = false) {
  if (isWinner) {
    // Enhanced glow for winner
    switch (rarity) {
      case 'covert': return 'drop-shadow-glow-covert-hover animate-pulse'
      case 'classified': return 'drop-shadow-glow-classified-hover animate-pulse'
      case 'restricted': return 'drop-shadow-glow-restricted-hover animate-pulse'
      case 'mil-spec': return 'drop-shadow-glow-milspec-hover animate-pulse'
      case 'knife': return 'drop-shadow-glow-knife-hover animate-pulse'
      case 'gold': return 'drop-shadow-glow-knife-hover animate-pulse'
      case 'glove': return 'drop-shadow-glow-knife-hover animate-pulse'
      default: return 'drop-shadow-glow-default-hover animate-pulse'
    }
  }
  
  // Normal glow
  switch (rarity) {
    case 'covert': return 'drop-shadow-glow-covert hover:drop-shadow-glow-covert-hover'
    case 'classified': return 'drop-shadow-glow-classified hover:drop-shadow-glow-classified-hover'
    case 'restricted': return 'drop-shadow-glow-restricted hover:drop-shadow-glow-restricted-hover'
    case 'mil-spec': return 'drop-shadow-glow-milspec hover:drop-shadow-glow-milspec-hover'
    case 'knife': return 'drop-shadow-glow-knife hover:drop-shadow-glow-knife-hover'
    case 'gold': return 'drop-shadow-glow-knife hover:drop-shadow-glow-knife-hover'
    case 'glove': return 'drop-shadow-glow-knife hover:drop-shadow-glow-knife-hover'
    default: return 'drop-shadow-glow-default hover:drop-shadow-glow-default-hover'
  }
}

function generateSkins() {
  allSkins.value = []
  
  // Fill strip with random skins
  for (let i = 0; i < totalItems; i++) {
    const rarity = getRandomRarity()
    let skin = getRandomSkinByRarity(rarity)
    if (!skin) skin = props.skins[Math.floor(Math.random() * props.skins.length)]
    allSkins.value.push(skin)
  }
  
  // Determine winner position - where the animation will stop
  // This ensures the skin at this position will be in the center
  const minStopPosition = totalItems - 20 // Don't stop too early
  const maxStopPosition = totalItems - 5  // Don't stop too late
  winnerIndex.value = Math.floor(Math.random() * (maxStopPosition - minStopPosition)) + minStopPosition
  
  // Replace the skin at winner position with a properly rolled winner
  const winnerRarity = getRandomRarity()
  const winner = getRandomSkinByRarity(winnerRarity)
  if (winner) {
    allSkins.value[winnerIndex.value] = winner
  }
}

onMounted(async () => {
  generateSkins()
  await nextTick()
  
  // Start with opening animation
  setTimeout(() => {
    isOpening.value = true
    
    // Start the roll after opening
    setTimeout(() => {
      startRoll()
    }, 100) // Much faster opening
  }, 10) // Almost instant start
})

function startRoll() {
  // Reset animation state
  offset.value = 0
  animationComplete.value = false
  lastTick = 0
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // Calculate where to stop with some randomness for excitement
  // Center of viewport is at 450px (half of 900px width)
  // Add random offset to create suspense - sometimes stop just before/after rare items
  const centerViewport = 450
  const randomOffset = (Math.random() - 0.5) * (itemWidth * 0.8) // Random offset up to 80% of item width
  const finalOffset = (winnerIndex.value * itemWidth) - centerViewport + (itemWidth / 2) + randomOffset
  
  const start = performance.now()
  let startOffset = 0
  
  function step(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / totalDuration, 1)
    
    // Use easing function for smooth deceleration
    const eased = easeOutCubic(progress)
    offset.value = startOffset + (finalOffset - startOffset) * eased
    
    // Tick sound every time we pass an item
    const currentItem = Math.floor((offset.value + centerViewport) / itemWidth)
    if (currentItem !== lastTick && currentItem >= 0 && currentItem < totalItems) {
      playTick()
      lastTick = currentItem
    }
    
    if (progress < 1) {
      animationId = requestAnimationFrame(step)
    } else {
      // Animation complete - find the skin closest to center line
      animationComplete.value = true
      
      // The center line is at position 450px (half of 900px width)
      // Calculate which item's center aligns with the center line
      const centerLinePosition = 450
      // Add half item width to account for item center, not left edge
      const actualWinnerIndex = Math.round((offset.value + centerLinePosition - itemWidth/2) / itemWidth)
      const clampedIndex = Math.max(0, Math.min(actualWinnerIndex, totalItems - 1))
      let actualWinner = allSkins.value[clampedIndex]
      
      // Handle gold items - randomly select from goldItems array
      if (actualWinner.rarity === 'gold' && actualWinner.goldItems) {
        const randomGoldItem = actualWinner.goldItems[Math.floor(Math.random() * actualWinner.goldItems.length)]
        actualWinner = randomGoldItem
      }
      
      // Update winner index for visual effects
      winnerIndex.value = clampedIndex
      
      setTimeout(() => emit('done', actualWinner), 800)
    }
  }
  
  animationId = requestAnimationFrame(step)
}

// Cleanup function
function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.case-opening-horizontal {
  animation: openHorizontal 0.1s ease-out forwards;
}

@keyframes openHorizontal {
  0% {
    clip-path: inset(0 50% 0 50%);
  }
  100% {
    clip-path: inset(0 0% 0 0%);
  }
}
</style>