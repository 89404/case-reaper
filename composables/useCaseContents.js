import { ref } from 'vue'

const skins = ref([])

export default function useCaseContents() {
  async function fetchCaseContents(caseId) {
    const res = await fetch(`http://localhost:4000/api/cases/${caseId}/contents`)
    skins.value = await res.json()
  }
  return { skins, fetchCaseContents }
}