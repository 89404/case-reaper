export const useApi = () => {
  // For Nuxt server API routes, we use relative URLs
  // This works both in development and production
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        ...options
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }
  
  return { apiCall }
}