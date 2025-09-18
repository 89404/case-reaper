import { ref } from 'vue'

export const user = ref(null)

export async function fetchUser() {
  try {
    const res = await fetch('http://localhost:4000/api/auth/user', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      user.value = data
    } else {
      user.value = null
    }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    user.value = null
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