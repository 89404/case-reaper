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
  
  // Check if user is authenticated
  const authCookie = getCookie(event, 'steam-auth')
  if (authCookie) {
    try {
      const user = JSON.parse(authCookie)
      // TODO: Add database integration here to save item to user's inventory
      // For now, we'll just add the user info to the response
      item.addedToInventory = true
      item.userId = user.steamId
    } catch (error) {
      console.warn('Failed to parse auth cookie:', error.message)
    }
  }
  
  return item
})