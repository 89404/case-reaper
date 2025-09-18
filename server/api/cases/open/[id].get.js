import CaseData from '../../../seed/cases.js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const csCase = CaseData.find(c => c._id === id)
  if (!csCase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Case niet gevonden'
    })
  }
  
  // Select random item from case
  const item = csCase.skins[Math.floor(Math.random() * csCase.skins.length)]
  
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