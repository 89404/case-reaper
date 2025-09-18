<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-radial" :class="backgroundGradient(skin.rarity)" :style="{ opacity: backgroundOpacity }"></div>
      
      <!-- Particle Effects -->
       <div v-for="particle in particles" :key="particle.id" 
            class="absolute w-3 h-3 rounded-full animate-particle-float"
            :class="particleColor(skin.rarity)"
            :style="{
              left: particle.x + 'px',
              top: particle.y + 'px',
              animationDelay: particle.delay + 's',
              animationDuration: particle.duration + 's'
            }">
       </div>
       
       <!-- Floating Sparkles -->
       <div v-for="sparkle in sparkles" :key="sparkle.id"
            class="absolute text-3xl animate-sparkle pointer-events-none select-none"
            :style="{
              left: sparkle.x + 'px',
              top: sparkle.y + 'px',
              animationDelay: sparkle.delay + 's',
              animationDuration: sparkle.duration + 's',
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
            }">
         ✨
       </div>
       
       <!-- Additional Glow Orbs -->
       <div v-for="orb in glowOrbs" :key="orb.id"
            class="absolute rounded-full blur-sm animate-float"
            :class="orbColor(skin.rarity)"
            :style="{
              left: orb.x + 'px',
              top: orb.y + 'px',
              width: orb.size + 'px',
              height: orb.size + 'px',
              animationDelay: orb.delay + 's',
              animationDuration: orb.duration + 's',
              opacity: orb.opacity
            }">
       </div>
    </div>
    
    <!-- Main Result Display -->
    <div class="relative flex flex-col items-center justify-center transform transition-all duration-1000 ease-out" 
         :style="{ transform: cardTransform }">
      
      <!-- Weapon Image with Enhanced Effects -->
      <div class="relative mb-8">
        <!-- Main Image - Much Larger with Case Roll Style Glow -->
        <img :src="skin.image" 
             :alt="skin.name" 
             class="relative w-96 h-72 object-contain transition-all duration-500 hover:scale-105" 
             :class="getCaseRollGlowClass(skin.rarity)"
             :style="{ transform: imageTransform, filter: 'brightness(1.1) contrast(1.1)' }" />
        
        <!-- Rarity Badge -->
        <div class="absolute -top-4 -right-4 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
             :class="rarityBadgeClass(skin.rarity)">
          {{ skin.rarity }}
        </div>
      </div>
      
      <!-- Weapon Name with Animation -->
      <div class="text-4xl font-bold mb-4 text-center transition-all duration-500" 
           :class="rarityClass(skin.rarity)"
           :style="{ transform: nameTransform, textShadow: '0 0 20px currentColor' }">
        {{ skin.name }}
      </div>
      
      <!-- Price with Animation -->
      <div class="text-2xl font-bold mb-8 transition-all duration-500" 
           :class="rarityClass(skin.rarity)"
           :style="{ transform: priceTransform, textShadow: '0 0 15px currentColor' }">
        {{ skin.price ? skin.price.toFixed(2) + ' €' : '' }}
      </div>
      
      <!-- Action Buttons -->
      <div class="flex gap-6 mt-6 transition-all duration-700" 
             :style="{ transform: buttonsTransform, opacity: buttonsOpacity }">
          <button @click="onClose" 
                  class="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 hover:scale-105 font-semibold">
            Close
          </button>
          <button @click="onAgain" 
                  class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg">
            Open Again
          </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  skin: { type: Object, required: true },
  onAgain: { type: Function, required: true },
  onClose: { type: Function, required: true }
})

// Animation states
const animationPhase = ref(0) // 0: initial, 1: entrance, 2: settled
const particles = ref([])
const sparkles = ref([])
const glowOrbs = ref([])

// Computed animation properties
const backgroundOpacity = computed(() => {
  return animationPhase.value >= 1 ? 0.3 : 0
})

const glowOpacity = computed(() => {
  return animationPhase.value >= 1 ? 0.8 : 0
})

const imageGlowOpacity = computed(() => {
  return animationPhase.value >= 1 ? 0.6 : 0
})

const cardTransform = computed(() => {
  switch (animationPhase.value) {
    case 0: return 'scale(0.3) translateY(100px) rotateX(45deg)'
    case 1: return 'scale(1.1) translateY(-10px) rotateX(0deg)'
    default: return 'scale(1) translateY(0px) rotateX(0deg)'
  }
})

const imageTransform = computed(() => {
  switch (animationPhase.value) {
    case 0: return 'scale(0.5) rotateY(180deg)'
    case 1: return 'scale(1.1) rotateY(0deg)'
    default: return 'scale(1) rotateY(0deg)'
  }
})

const nameTransform = computed(() => {
  switch (animationPhase.value) {
    case 0: return 'translateY(30px)'
    case 1: return 'translateY(-5px)'
    default: return 'translateY(0px)'
  }
})

const priceTransform = computed(() => {
  switch (animationPhase.value) {
    case 0: return 'translateY(30px)'
    case 1: return 'translateY(-3px)'
    default: return 'translateY(0px)'
  }
})

const buttonsTransform = computed(() => {
  switch (animationPhase.value) {
    case 0: return 'translateY(50px)'
    case 1: return 'translateY(-5px)'
    default: return 'translateY(0px)'
  }
})

const buttonsOpacity = computed(() => {
  return animationPhase.value >= 2 ? 1 : 0
})

const cardAnimation = computed(() => {
  return animationPhase.value >= 1 ? 'animate-pulse' : ''
})

// Rarity-based styling functions
function rarityClass(rarity) {
  switch (rarity) {
    case 'covert': return 'border-[#ff4655] text-[#ff4655]'
    case 'classified': return 'border-pink-500 text-pink-400'
    case 'restricted': return 'border-purple-500 text-purple-400'
    case 'mil-spec': return 'border-blue-500 text-blue-400'
    case 'knife': return 'border-yellow-400 text-yellow-300'
    case 'gold': return 'border-yellow-500 text-yellow-400'
    case 'glove': return 'border-orange-500 text-orange-400'
    default: return 'border-gray-700 text-gray-300'
  }
}

function backgroundGradient(rarity) {
  switch (rarity) {
    case 'covert': return 'from-red-900/20 via-red-600/10 to-transparent'
    case 'classified': return 'from-pink-900/20 via-pink-600/10 to-transparent'
    case 'restricted': return 'from-purple-900/20 via-purple-600/10 to-transparent'
    case 'mil-spec': return 'from-blue-900/20 via-blue-600/10 to-transparent'
    case 'knife': return 'from-yellow-900/20 via-yellow-600/10 to-transparent'
    case 'gold': return 'from-yellow-900/30 via-yellow-500/20 to-transparent'
    case 'glove': return 'from-orange-900/20 via-orange-600/10 to-transparent'
    default: return 'from-gray-900/20 via-gray-600/10 to-transparent'
  }
}

function glowClass(rarity) {
  switch (rarity) {
    case 'covert': return 'bg-red-500/30'
    case 'classified': return 'bg-pink-500/30'
    case 'restricted': return 'bg-purple-500/30'
    case 'mil-spec': return 'bg-blue-500/30'
    case 'knife': return 'bg-yellow-500/30'
    case 'gold': return 'bg-yellow-500/40'
    case 'glove': return 'bg-orange-500/30'
    default: return 'bg-gray-500/30'
  }
}

function imageGlowClass(rarity) {
  switch (rarity) {
    case 'covert': return 'bg-red-500/40'
    case 'classified': return 'bg-pink-500/40'
    case 'restricted': return 'bg-purple-500/40'
    case 'mil-spec': return 'bg-blue-500/40'
    case 'knife': return 'bg-yellow-500/40'
    case 'gold': return 'bg-yellow-500/50'
    case 'glove': return 'bg-orange-500/40'
    default: return 'bg-gray-500/40'
  }
}

function getImageGlowClass(rarity) {
  switch (rarity) {
    case 'covert': return 'drop-shadow-[0_0_25px_rgba(255,70,85,0.8)]'
    case 'classified': return 'drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]'
    case 'restricted': return 'drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]'
    case 'mil-spec': return 'drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]'
    case 'knife': return 'drop-shadow-[0_0_30px_rgba(251,191,36,0.9)]'
    case 'gold': return 'drop-shadow-[0_0_35px_rgba(251,191,36,1.0)]'
    case 'glove': return 'drop-shadow-[0_0_25px_rgba(249,115,22,0.8)]'
    default: return 'drop-shadow-[0_0_15px_rgba(107,114,128,0.6)]'
  }
}

function getCaseRollGlowClass(rarity) {
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

function rarityBadgeClass(rarity) {
  switch (rarity) {
    case 'covert': return 'bg-red-600/20 text-[#ff4655] border border-[#ff4655]'
    case 'classified': return 'bg-pink-600 text-white'
    case 'restricted': return 'bg-purple-600 text-white'
    case 'mil-spec': return 'bg-blue-600 text-white'
    case 'knife': return 'bg-yellow-600 text-black'
    case 'gold': return 'bg-yellow-500 text-black'
    case 'glove': return 'bg-orange-600 text-white'
    default: return 'bg-gray-600 text-white'
  }
}

function particleColor(rarity) {
  switch (rarity) {
    case 'covert': return 'bg-red-400'
    case 'classified': return 'bg-pink-400'
    case 'restricted': return 'bg-purple-400'
    case 'mil-spec': return 'bg-blue-400'
    case 'knife': return 'bg-yellow-400'
    case 'gold': return 'bg-yellow-400'
    case 'glove': return 'bg-orange-400'
    default: return 'bg-gray-400'
  }
}

function orbColor(rarity) {
  switch (rarity) {
    case 'covert': return 'bg-red-500/20'
    case 'classified': return 'bg-pink-500/20'
    case 'restricted': return 'bg-purple-500/20'
    case 'mil-spec': return 'bg-blue-500/20'
    case 'knife': return 'bg-yellow-500/20'
    case 'gold': return 'bg-yellow-500/30'
    case 'glove': return 'bg-orange-500/20'
    default: return 'bg-gray-500/20'
  }
}

// Particle generation
function generateParticles() {
  particles.value = []
  for (let i = 0; i < 50; i++) {
    particles.value.push({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3
    })
  }
}

function generateSparkles() {
  sparkles.value = []
  for (let i = 0; i < 20; i++) {
    sparkles.value.push({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2
    })
  }
}

function generateGlowOrbs() {
  glowOrbs.value = []
  for (let i = 0; i < 15; i++) {
    glowOrbs.value.push({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 40,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3
    })
  }
}

// Sound system
const raritySounds = {
  'covert': '/sounds/case_reward_covert.mp3',
  'classified': '/sounds/case_reward_classified.mp3',
  'restricted': '/sounds/case_reward_restricted.mp3',
  'mil-spec': '/sounds/case_reward_milspec.mp3',
  'knife': '/sounds/case_reward_knife.mp3',
  'gold': '/sounds/case_reward_knife.mp3',
  'glove': '/sounds/case_reward_knife.mp3',
}

function playSound(src) {
  const audio = new Audio(src)
  audio.volume = 0.7
  audio.play()
}

// Animation sequence
function startAnimation() {
  // Phase 1: Entrance animation
  setTimeout(() => {
    animationPhase.value = 1
  }, 100)
  
  // Phase 2: Settle animation
  setTimeout(() => {
    animationPhase.value = 2
  }, 1200)
}

onMounted(() => {
  generateParticles()
  generateSparkles()
  generateGlowOrbs()
  
  // Remove duplicate case open sound
  // playSound('/sounds/case_open.mp3')
  
  // Play reward sound per rarity
  const rarity = props.skin.rarity
  const sound = raritySounds[rarity] || '/sounds/case_reward_milspec.mp3'
  setTimeout(() => playSound(sound), 500)
  
  startAnimation()
})
</script>