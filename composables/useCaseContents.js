import { ref } from 'vue'

export const useCaseContents = () => {
  const contents = ref([])
  const { apiCall } = useApi()
  
  const fetchCaseContents = async (caseId) => {
    try {
      contents.value = await apiCall(`/api/cases/${caseId}/contents`)
    } catch (error) {
      console.error('Failed to fetch case contents:', error)
    }
  }
  
  return { contents, fetchCaseContents }
}