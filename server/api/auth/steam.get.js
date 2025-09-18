export default defineEventHandler(async (event) => {
  // Steam OAuth redirect URL
  const steamApiKey = process.env.STEAM_API_KEY || 'YOUR_STEAM_API_KEY_HERE'
  const returnUrl = process.env.STEAM_RETURN_URL || `${getHeader(event, 'origin') || 'http://localhost:3000'}/api/auth/steam/callback`
  const realm = process.env.STEAM_REALM || getHeader(event, 'origin') || 'http://localhost:3000'
  
  const steamAuthUrl = `https://steamcommunity.com/openid/login?` +
    `openid.ns=http://specs.openid.net/auth/2.0&` +
    `openid.mode=checkid_setup&` +
    `openid.return_to=${encodeURIComponent(returnUrl)}&` +
    `openid.realm=${encodeURIComponent(realm)}&` +
    `openid.identity=http://specs.openid.net/auth/2.0/identifier_select&` +
    `openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`
  
  return sendRedirect(event, steamAuthUrl)
})