export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Verify Steam OpenID response
  if (query['openid.mode'] !== 'id_res') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Steam authentication response'
    })
  }
  
  // Extract Steam ID from the identity URL
  const steamIdMatch = query['openid.identity']?.match(/\/id\/(\d+)$/)
  if (!steamIdMatch) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Could not extract Steam ID'
    })
  }
  
  const steamId = steamIdMatch[1]
  
  // Verify the response with Steam
  const verificationParams = new URLSearchParams()
  verificationParams.append('openid.assoc_handle', query['openid.assoc_handle'] || '')
  verificationParams.append('openid.signed', query['openid.signed'] || '')
  verificationParams.append('openid.sig', query['openid.sig'] || '')
  verificationParams.append('openid.ns', query['openid.ns'] || '')
  verificationParams.append('openid.mode', 'check_authentication')
  
  // Add all signed fields
  const signedFields = (query['openid.signed'] || '').split(',')
  for (const field of signedFields) {
    const key = `openid.${field}`
    if (query[key]) {
      verificationParams.append(key, query[key])
    }
  }
  
  try {
    const verificationResponse = await $fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      body: verificationParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    if (!verificationResponse.includes('is_valid:true')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Steam authentication verification failed'
      })
    }
    
    // Get user profile from Steam API
    const steamApiKey = process.env.STEAM_API_KEY
    if (steamApiKey && steamApiKey !== 'YOUR_STEAM_API_KEY_HERE') {
      try {
        const profileResponse = await $fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`)
        const profile = profileResponse.response?.players?.[0]
        
        if (profile) {
          // TODO: Save user to database here
          // For now, we'll just set a session cookie
          
          // Set authentication cookie
          setCookie(event, 'steam-auth', JSON.stringify({
            steamId: steamId,
            displayName: profile.personaname,
            avatar: profile.avatar,
            profileUrl: profile.profileurl
          }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
        }
      } catch (error) {
        console.warn('Failed to fetch Steam profile:', error.message)
        // Continue with basic auth even if profile fetch fails
        setCookie(event, 'steam-auth', JSON.stringify({
          steamId: steamId,
          displayName: `User ${steamId}`,
          avatar: '',
          profileUrl: ''
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }
    } else {
      // No Steam API key, use basic auth
      setCookie(event, 'steam-auth', JSON.stringify({
        steamId: steamId,
        displayName: `User ${steamId}`,
        avatar: '',
        profileUrl: ''
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }
    
    // Redirect to home page
    return sendRedirect(event, '/')
    
  } catch (error) {
    console.error('Steam authentication error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed'
    })
  }
})