export default defineEventHandler(async (event) => {
  // Clear the authentication cookie
  deleteCookie(event, 'steam-auth')
  
  return { success: true, message: 'Logged out successfully' }
})