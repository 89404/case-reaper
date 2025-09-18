import { ref } from 'vue'
import { useApi } from './useApi'

export const useCases = () => {
  const cases = ref([])
  const { apiCall } = useApi()
  
  const fetchCases = async () => {
    try {
      cases.value = await apiCall('/api/cases')
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    }
  }
  
  return { cases, fetchCases }
}