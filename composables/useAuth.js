import { ref } from 'vue'

export const user = ref(null)

export async function fetchUser() {
  try {
    const { apiCall } = useApi()
    user.value = await apiCall('/api/auth/user')
  } catch (error) {
    console.error('Failed to fetch user:', error)
    user.value = null
  }
}
}

export function useAuth() {
  return {
    user,
    fetchUser
  }
}

export function useSteamProfile() {
  return {
    displayName: user.value?.username || '',
    avatar: user.value?.avatar || ''
  }
}