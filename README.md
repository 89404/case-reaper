# Case Reaper - CS2 Case Opening Simulator

Een schoolproject prototype voor een Counter-Strike 2 case opening simulator met echte Steam login, multiplayer case battles, en een clean, minimalistisch design geïnspireerd op case.oki.gg.

## Features
- Echte Steam login (passport-steam)
- Case opener systeem (voorbeeldcases en skins)
- Multiplayer case battles (Socket.io)
- Upgrade systeem (30% kans op upgrade)
- Simulated inventory (niet gekoppeld aan Steam)
- Leaderboards (meeste waarde, meeste cases geopend, usernames van Steam)
- Donker kleurthema, grote knoppen, simpele animaties

## Stack
- **Frontend:** Nuxt.js 3 (Vue)
- **Backend:** Node.js (Nuxt server routes)
- **Styling:** TailwindCSS
- **Database:** MongoDB (Atlas of lokaal)
- **Auth:** Steam login (passport-steam)
- **Real-time:** Socket.io

## Installatie
1. Clone deze repo
2. Installeer dependencies:
   ```bash
   npm install
   ```
3. Maak een `.env` bestand aan (zie voorbeeld hieronder)
4. Start de development server:
   ```bash
   npm run dev
   ```

### .env voorbeeld
```
STEAM_API_KEY=your_steam_api_key
STEAM_RETURN_URL=http://localhost:3000/auth/steam/return
STEAM_REALM=http://localhost:3000/
MONGODB_URI=mongodb://localhost:27017/casereaper
SESSION_SECRET=your_secret
```

## Steam login configureren
- Maak een Steam API key aan via https://steamcommunity.com/dev/apikey
- Vul de key en return URLs in je `.env` in
- Login werkt via `/login` pagina

## Hoe werken battles?
- Je joint een battle via `/case-battles`
- Socket.io zorgt voor real-time communicatie
- Battle start als er 2+ spelers zijn, iedereen opent cases tegelijk
- Winnaar = hoogste totale waarde

## Seeder
- Start de app, run `node seed/seed.js` om voorbeeldcases en skins toe te voegen

## Projectstructuur
- `pages/` - Nuxt pagina's
- `server/` - API, auth, Socket.io, models
- `composables/` - State management
- `tailwind.config.js` - Styling config

## 🚀 Deployment to Vercel

### Prerequisites
1. A Vercel account (free at vercel.com)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Steps:
1. **Push to Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repository-url
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect it's a Nuxt.js project

3. **Configure Environment Variables:**
   In your Vercel dashboard, add these environment variables:
   ```
   STEAM_API_KEY=your_steam_api_key
   STEAM_RETURN_URL=https://your-app.vercel.app/api/auth/steam/return
   STEAM_REALM=https://your-app.vercel.app/
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   NUXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app
   NUXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

### Important Notes:
- Replace `your-app` with your actual Vercel app name
- Update Steam return URL in your Steam API settings
- Make sure your MongoDB allows connections from Vercel's IP ranges

## Note
This is a school project prototype and may contain bugs or incomplete features. 