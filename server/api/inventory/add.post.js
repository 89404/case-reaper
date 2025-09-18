export default defineEventHandler(async (event) => {
  // Check if user is authenticated
  const authCookie = getCookie(event, 'steam-auth')
  if (!authCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }
  
  try {
    const user = JSON.parse(authCookie)
    const body = await readBody(event)
    
    // Validate the item data
    if (!body || !body.name || !body.price) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid item data'
      })
    }
    
    // TODO: Add database integration here to save item to user's inventory
    // For now, we'll just return success
    console.log(`Adding item to inventory for user ${user.steamId}:`, body)
    
    return { 
      success: true, 
      message: 'Item added to inventory',
      item: body,
      userId: user.steamId
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Failed to parse auth cookie or request body:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})