export const useApi = () => {
  const baseURL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
  
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
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