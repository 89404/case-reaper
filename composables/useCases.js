import { ref } from 'vue'
import { useApi } from './useApi'

export const useCases = () => {
  const cases = ref([])
  const { apiCall } = useApi()
  
  const fetchCases = async () => {
    try {
      console.log('useCases: Starting to fetch cases...')
      const result = await apiCall('/api/cases')
      console.log('useCases: API call result:', result)
      cases.value = result
      console.log('useCases: Cases assigned:', cases.value)
    } catch (error) {
      console.error('useCases: Failed to fetch cases:', error)
    }
  }
  
  return { cases, fetchCases }
}