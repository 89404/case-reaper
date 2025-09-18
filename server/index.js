import express from 'express'
import session from 'express-session'
import passport from 'passport'
import SteamStrategy from 'passport-steam'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
dotenv.config()

import User from './models/User.js'
import Inventory from './models/Inventory.js'
import Battle from './models/Battle.js'
import apiRoutes from './routes/api.js'

const app = express()
const server = createServer(app)
const io = new Server(server)

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully')
  })
  .catch((error) => {
    console.warn('⚠️  MongoDB connection failed:', error.message)
    console.warn('⚠️  Server will continue without database functionality')
  })

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
  try {
    // Handle temporary users (when database is unavailable)
    if (typeof id === 'string' && id.startsWith('temp_')) {
      const tempUser = {
        _id: id,
        steamId: id.replace('temp_', ''),
        username: 'Guest User',
        avatar: '',
        totalValue: 0,
        casesOpened: 0,
        isTemporary: true
      }
      return done(null, tempUser)
    }
    
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    console.warn('Database error in deserializeUser:', error.message)
    done(null, null)
  }
})
passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL,
  realm: process.env.STEAM_REALM,
  apiKey: process.env.STEAM_API_KEY || 'YOUR_STEAM_API_KEY_HERE'
}, async (identifier, profile, done) => {
  try {
    let user = await User.findOne({ steamId: profile.id })
    if (!user) {
      user = await User.create({ 
        steamId: profile.id, 
        username: profile.displayName, 
        avatar: profile.photos && profile.photos[2] ? profile.photos[2].value : profile.photos[0].value,
        totalValue: 0,
        casesOpened: 0
      })
    }
    done(null, user)
  } catch (error) {
    console.warn('Database error in Steam authentication:', error.message)
    // Create a temporary user object when database is unavailable
    const tempUser = {
      _id: 'temp_' + profile.id,
      steamId: profile.id,
      username: profile.displayName,
      avatar: profile.photos && profile.photos[2] ? profile.photos[2].value : profile.photos[0].value,
      totalValue: 0,
      casesOpened: 0,
      isTemporary: true
    }
    done(null, tempUser)
  }
}))

app.get('/api/auth/steam', passport.authenticate('steam'))
app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/login' }), (req, res) => res.redirect('http://localhost:3000/'))
app.get('/api/auth/user', (req, res) => res.json(req.user || null))
app.get('/api/auth/logout', (req, res) => { req.logout(() => res.redirect('/')) })

// API routes (cases, inventory, upgrade, leaderboard)
app.use(express.json())
apiRoutes(app)

// Socket.io battles
const waitingPlayers = []
const activeBattles = new Map()

// Round-based battle system
async function startRoundBasedBattle(battleId, socketIds) {
  const maxRounds = 5
  let currentRound = 0
  
  const playNextRound = async () => {
    if (currentRound >= maxRounds) {
      // Battle finished, determine winner
      const result = await Battle.finish(battleId)
      socketIds.forEach(socketId => {
        io.to(socketId).emit('battleEnd', result)
      })
      activeBattles.delete(battleId)
      return
    }
    
    currentRound++
    
    // Notify players that round is starting
    socketIds.forEach(socketId => {
      io.to(socketId).emit('roundStarting', { 
        round: currentRound, 
        maxRounds,
        battleId 
      })
    })
    
    // Wait 2 seconds for anticipation
    setTimeout(async () => {
      try {
        // Play the round (both players open cases simultaneously)
        const updatedBattle = await Battle.playRound(battleId)
        
        if (updatedBattle) {
          // Send round results to both players
          socketIds.forEach(socketId => {
            io.to(socketId).emit('roundResult', {
              battle: updatedBattle,
              round: currentRound
            })
          })
          
          // Wait 3 seconds to show results, then play next round
          setTimeout(() => {
            playNextRound()
          }, 3000)
        }
      } catch (error) {
        console.error('Round play error:', error)
        socketIds.forEach(socketId => {
          io.to(socketId).emit('error', 'Battle error occurred')
        })
        activeBattles.delete(battleId)
      }
    }, 2000)
  }
  
  // Start first round after a short delay
  setTimeout(() => {
    playNextRound()
  }, 1000)
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('joinBattle', async (userData) => {
    if (!userData || !userData.userId) {
      socket.emit('error', 'Authentication required')
      return
    }
    
    const player = {
      socketId: socket.id,
      userId: userData.userId,
      username: userData.username,
      avatar: userData.avatar
    }
    
    // Check if player is already waiting
    const existingIndex = waitingPlayers.findIndex(p => p.userId === userData.userId)
    if (existingIndex !== -1) {
      waitingPlayers.splice(existingIndex, 1)
    }
    
    if (waitingPlayers.length > 0) {
      // Start battle with waiting player
      const opponent = waitingPlayers.shift()
      const battlePlayers = [opponent, player]
      
      try {
        const battle = await Battle.start(battlePlayers)
        activeBattles.set(battle._id.toString(), {
          players: battlePlayers,
          battleId: battle._id.toString()
        })
        
        // Notify both players
        io.to(opponent.socketId).emit('battleStarted', battle)
        io.to(player.socketId).emit('battleStarted', battle)
        
        // Start round-based battle system
        startRoundBasedBattle(battle._id.toString(), [opponent.socketId, player.socketId])
        
      } catch (error) {
        console.error('Battle start error:', error)
        socket.emit('error', 'Failed to start battle')
      }
    } else {
      // Add to waiting list
      waitingPlayers.push(player)
      socket.emit('waiting')
    }
  })
  
  socket.on('leaveBattle', () => {
    // Remove from waiting list
    const index = waitingPlayers.findIndex(p => p.socketId === socket.id)
    if (index !== -1) {
      waitingPlayers.splice(index, 1)
    }
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    // Remove from waiting list
    const index = waitingPlayers.findIndex(p => p.socketId === socket.id)
    if (index !== -1) {
      waitingPlayers.splice(index, 1)
    }
  })
})

server.listen(4000, () => console.log('Server running on http://localhost:4000'))