import { ref } from 'vue'
import { useApi } from './useApi'

export const useCaseContents = () => {
  const contents = ref([])
  const { apiCall } = useApi()
  
  const fetchCaseContents = async (caseId) => {
    try {
      console.log('Fetching case contents for:', caseId)
      const result = await apiCall(`/api/cases/${caseId}/contents`)
      console.log('Case contents fetched:', result)
      contents.value = result
    } catch (error) {
      console.error('Failed to fetch case contents:', error)
    }
  }
  
  return { contents, fetchCaseContents }
}