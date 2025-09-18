module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: '#181f2a',
        surface: '#232b3a',
        accent: '#ffb43a',
        accent2: '#ff6b6b',
        primary: '#f4f4f4',
        secondary: '#a0aec0',
        green: '#3eea7a',
        red: '#ff4d4f',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      dropShadow: {
        'glow-covert': '0 0 20px rgba(255, 70, 85, 0.8)',
        'glow-covert-hover': '0 0 35px rgba(255, 70, 85, 1)',
        'glow-classified': '0 0 20px rgba(236, 72, 153, 0.8)',
        'glow-classified-hover': '0 0 35px rgba(236, 72, 153, 1)',
        'glow-restricted': '0 0 20px rgba(168, 85, 247, 0.8)',
        'glow-restricted-hover': '0 0 35px rgba(168, 85, 247, 1)',
        'glow-milspec': '0 0 20px rgba(59, 130, 246, 0.8)',
        'glow-milspec-hover': '0 0 35px rgba(59, 130, 246, 1)',
        'glow-knife': '0 0 25px rgba(251, 191, 36, 0.9)',
        'glow-knife-hover': '0 0 40px rgba(251, 191, 36, 1)',
        'glow-default': '0 0 12px rgba(107, 114, 128, 0.6)',
        'glow-default-hover': '0 0 20px rgba(107, 114, 128, 0.8)',
      },
      animation: {
        'particle-float': 'particleFloat 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '1' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}