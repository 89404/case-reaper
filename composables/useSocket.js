import { ref, readonly } from 'vue'
import { io } from 'socket.io-client'

let socket = null
const isConnected = ref(false)
const error = ref(null)

export function useSocket() {
  if (!socket) {
    socket = io('http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })
    
    socket.on('connect', () => {
      console.log('Connected to server')
      isConnected.value = true
      error.value = null
    })
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      isConnected.value = false
    })
    
    socket.on('error', (err) => {
      console.error('Socket error:', err)
      error.value = err
    })
  }
  
  return { 
    socket, 
    isConnected: readonly(isConnected), 
    error: readonly(error)
  }
}