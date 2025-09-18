<template>
  <div class="min-h-screen bg-background text-primary flex flex-col items-center justify-center">
    <div class="bg-surface p-8 rounded-lg shadow-lg flex flex-col items-center max-w-md w-full">
      <h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">CS:GO & CS2 SKINS UPGRADER</h1>
      <p class="mb-6 text-secondary text-center">Choose your multiplier and risk level!<br><span class="text-red-400 text-sm">⚠️ Failure means losing your item</span></p>
      
      <div class="w-full mb-4">
        <label class="block text-sm font-medium mb-2">Select item to upgrade:</label>
        <select v-model="selectedItem" class="w-full p-3 rounded-lg bg-background border border-gray-600 text-primary">
          <option disabled value="">Choose an item...</option>
          <option v-for="item in inventory" :key="item._id" :value="item._id">
            {{ item.name }} (€{{ item.price.toFixed(2) }})
          </option>
        </select>
      </div>
      
      <div v-if="selectedItemData" class="mb-6 p-4 bg-background rounded-lg w-full text-center">
        <img :src="selectedItemData.image" :alt="selectedItemData.name" class="w-16 h-16 mx-auto mb-2 object-contain" />
        <p class="font-semibold">{{ selectedItemData.name }}</p>
        <p class="text-secondary">Current: €{{ selectedItemData.price.toFixed(2) }}</p>
        <p class="text-green-400">If successful: €{{ (selectedItemData.price * selectedMultiplier).toFixed(2) }}</p>
      </div>
      
      <!-- Risk Percentage Display -->
      <div v-if="selectedItem" class="mb-6 text-center">
        <div class="text-6xl font-bold text-white mb-2">{{ riskPercentage.toFixed(3) }} %</div>
        <div class="text-sm text-gray-400">RISKY CHANCE</div>
        <div class="text-xs text-gray-500 mt-1">Minimum amount of skins must be at least $0.05 to get Nitro Points</div>
      </div>
      
      <!-- Multiplier Selection -->
      <div class="mb-6 w-full">
        <div class="flex justify-between gap-2">
          <button 
            v-for="mult in multipliers" 
            :key="mult"
            @click="selectedMultiplier = mult"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition',
              selectedMultiplier === mult 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            {{ mult }}x
          </button>
        </div>
      </div>
      
      <button 
        @click="upgrade" 
        :disabled="!selectedItem || upgrading" 
        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ upgrading ? 'Upgrading...' : `🎲 Upgrade ${selectedMultiplier}x` }}
      </button>
      
      <div v-if="result" class="mt-6 p-4 rounded-lg w-full text-center" :class="result.success ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'">
        <div class="text-xl font-bold" :class="result.success ? 'text-green-400' : 'text-red-400'">
          {{ result.success ? '🎉 SUCCESS!' : '💥 FAILED!' }}
        </div>
        <p class="mt-2">{{ result.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const inventory = ref([])
const selectedItem = ref('')
const result = ref(null)
const upgrading = ref(false)
const selectedMultiplier = ref(1.5)

// Available multipliers
const multipliers = [1.5, 2, 5, 10, 20]

const selectedItemData = computed(() => {
  if (!selectedItem.value) return null
  return inventory.value.find(item => item._id === selectedItem.value)
})

// Calculate risk percentage based on multiplier
const riskPercentage = computed(() => {
  const baseChance = 50 // 50% base chance for 1.5x
  const multiplierFactor = selectedMultiplier.value
  // Higher multipliers = lower success chance
  const successChance = Math.max(5, baseChance / (multiplierFactor * 0.8))
  return 100 - successChance
})

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

async function upgrade() {
  if (!selectedItem.value || upgrading.value) return
  
  upgrading.value = true
  result.value = null
  
  try {
    // Calculate success chance based on multiplier
    const baseChance = 50
    const successChance = Math.max(5, baseChance / (selectedMultiplier.value * 0.8))
    const isSuccess = Math.random() * 100 < successChance
    
    const selectedItemInfo = selectedItemData.value
    
    if (isSuccess) {
      // Success: Update item value
      const newPrice = selectedItemInfo.price * selectedMultiplier.value
      
      // Here you would typically call an API to update the item
      // For now, we'll simulate the upgrade locally
      const itemIndex = inventory.value.findIndex(item => item._id === selectedItem.value)
      if (itemIndex !== -1) {
        inventory.value[itemIndex].price = newPrice
        inventory.value[itemIndex].name = `${selectedItemInfo.name} (Upgraded ${selectedMultiplier.value}x)`
      }
      
      result.value = {
        success: true,
        message: `Success! Your ${selectedItemInfo.name} was upgraded to €${newPrice.toFixed(2)} (${selectedMultiplier.value}x multiplier)!`
      }
    } else {
      // Failure: Remove item from inventory
      inventory.value = inventory.value.filter(item => item._id !== selectedItem.value)
      
      result.value = {
        success: false,
        message: `Failed! Your ${selectedItemInfo.name} was lost in the upgrade attempt.`
      }
    }
    
    // Reset selected item
    selectedItem.value = ''
    
  } catch (error) {
    console.error('Upgrade error:', error)
    result.value = { success: false, message: 'Network error' }
  } finally {
    upgrading.value = false
  }
}
</script>