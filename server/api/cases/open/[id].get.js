import CaseData from '../../../seed/cases.js'

// Default odds per rarity (same as frontend)
const defaultOdds = [
  { rarity: 'mil-spec', chance: 79.97 },
  { rarity: 'restricted', chance: 15.98 },
  { rarity: 'classified', chance: 3.2 },
  { rarity: 'covert', chance: 0.64 },
  { rarity: 'knife', chance: 0.20 },
  { rarity: 'gold', chance: 0.06 },
]

function getRandomRarity() {
  const roll = Math.random() * 100
  let acc = 0
  for (const o of defaultOdds) {
    acc += o.chance
    if (roll < acc) return o.rarity
  }
  return 'mil-spec'
}

function getRandomSkinByRarity(skins, rarity) {
  const pool = skins.filter(s => s.rarity === rarity)
  if (pool.length === 0) return skins[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const csCase = CaseData.find(c => c._id === id)
  if (!csCase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Case niet gevonden'
    })
  }
  
  // Select item using proper rarity-based odds
  const winnerRarity = getRandomRarity()
  let item = getRandomSkinByRarity(csCase.skins, winnerRarity)
  
  // Handle gold items - randomly select from goldItems array
  if (item.rarity === 'gold' && item.goldItems) {
    const randomGoldItem = item.goldItems[Math.floor(Math.random() * item.goldItems.length)]
    item = randomGoldItem
  }
  
  // Check if user is authenticated and add item to inventory
  const authCookie = getCookie(event, 'steam-auth')
  if (authCookie) {
    try {
      const user = JSON.parse(authCookie)
      
      // Add item to user's inventory
      try {
        // For now, we'll just log it since we don't have database integration
        console.log(`Adding item to inventory for user ${user.steamId}:`, item)
        item.addedToInventory = true
        item.userId = user.steamId
      } catch (inventoryError) {
        console.warn('Failed to add item to inventory:', inventoryError.message)
        item.addedToInventory = false
      }
    } catch (error) {
      console.warn('Failed to parse auth cookie:', error.message)
    }
  } else {
    item.addedToInventory = false
  }
  
  return item
})