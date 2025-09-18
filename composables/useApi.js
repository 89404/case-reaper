export const useApi = () => {
  // For Nuxt server API routes, we use relative URLs
  // This works both in development and production
  const apiCall = async (endpoint, options = {}) => {
    try {
      console.log('useApi: Making API call to:', endpoint)
      const response = await fetch(endpoint, {
        credentials: 'include',
        ...options
      })
      console.log('useApi: Response received:', response.status, response.statusText)
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      console.log('useApi: Data parsed:', data)
      return data
    } catch (error) {
      console.error('useApi: API call failed:', error)
      throw error
    }
  }
  
  return { apiCall }
}