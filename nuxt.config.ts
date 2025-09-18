import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    steamApiKey: process.env.STEAM_API_KEY,
    steamReturnUrl: process.env.STEAM_RETURN_URL,
    steamRealm: process.env.STEAM_REALM,
    mongodbUri: process.env.MONGODB_URI,
    sessionSecret: process.env.SESSION_SECRET,
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL
    }
  },
  css: [
    '~/assets/css/tailwind.css',
  ],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})