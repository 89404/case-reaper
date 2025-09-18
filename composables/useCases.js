import { ref } from 'vue'

const cases = ref([])

export default function useCases() {
  async function fetchCases() {
    const res = await fetch('http://localhost:4000/api/cases')
    cases.value = await res.json()
  }
  return { cases, fetchCases }
} 