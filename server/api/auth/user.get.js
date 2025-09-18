export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'steam-auth')
  
  if (!authCookie) {
    return { user: null }
  }
  
  try {
    const user = JSON.parse(authCookie)
    return { user }
  } catch (error) {
    // Invalid cookie, clear it
    deleteCookie(event, 'steam-auth')
    return { user: null }
  }
})