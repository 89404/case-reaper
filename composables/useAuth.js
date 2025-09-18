import { ref } from 'vue'

export const user = ref(null)

export async function fetchUser() {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/api/auth/user')
    user.value = response.user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    user.value = null
  }
}

export async function logout() {
  try {
    const { apiCall } = useApi()
    await apiCall('/api/auth/logout', { method: 'POST' })
    user.value = null
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

export function loginWithSteam() {
  window.location.href = '/api/auth/steam'
}

export function useAuth() {
  return {
    user,
    fetchUser,
    logout,
    loginWithSteam
  }
}

export function useSteamProfile() {
  return {
    displayName: user.value?.displayName || '',
    avatar: user.value?.avatar || ''
  }
}