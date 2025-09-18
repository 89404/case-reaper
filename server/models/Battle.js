import mongoose from 'mongoose'
import CaseData from '../seed/cases.js'
import Inventory from './Inventory.js'
import User from './User.js'

const BattleSchema = new mongoose.Schema({
  players: [{ 
    userId: String, 
    username: String, 
    avatar: String,
    rounds: [{
      roundNumber: Number,
      item: Object,
      value: Number
    }],
    totalValue: { type: Number, default: 0 }
  }],
  currentRound: { type: Number, default: 0 },
  maxRounds: { type: Number, default: 5 },
  winner: { userId: String, username: String, totalValue: Number },
  finished: { type: Boolean, default: false },
  allItems: [Object] // All items won in the battle
})

BattleSchema.statics.start = async function (players) {
  // Initialize battle with players but no items yet
  const battlePlayers = players.map(player => ({
    userId: player.userId,
    username: player.username,
    avatar: player.avatar,
    rounds: [],
    totalValue: 0
  }))
  
  return this.create({ 
    players: battlePlayers,
    currentRound: 0,
    maxRounds: 5,
    allItems: []
  })
}

BattleSchema.statics.playRound = async function (battleId) {
  const battle = await this.findById(battleId)
  if (!battle || battle.finished) return null
  
  battle.currentRound += 1
  const roundItems = []
  
  // Generate items for both players simultaneously
  for (let i = 0; i < battle.players.length; i++) {
    const csCase = CaseData[Math.floor(Math.random() * CaseData.length)]
    const item = csCase.skins[Math.floor(Math.random() * csCase.skins.length)]
    const roundItem = {
      ...item,
      _id: new mongoose.Types.ObjectId()
    }
    
    battle.players[i].rounds.push({
      roundNumber: battle.currentRound,
      item: roundItem,
      value: item.price
    })
    battle.players[i].totalValue += item.price
    roundItems.push(roundItem)
    battle.allItems.push(roundItem)
  }
  
  await battle.save()
  return battle
}

BattleSchema.statics.finish = async function (battleId) {
  const battle = await this.findById(battleId)
  if (!battle || battle.finished) return null
  
  // Determine winner based on total value
  let winner = battle.players[0]
  for (const player of battle.players) {
    if (player.totalValue > winner.totalValue) {
      winner = player
    }
  }
  
  battle.winner = {
    userId: winner.userId,
    username: winner.username,
    totalValue: Math.round(winner.totalValue * 100) / 100
  }
  battle.finished = true
  
  // Award ALL items to the winner
  let winnerInventory = await Inventory.findOne({ userId: winner.userId })
  if (!winnerInventory) {
    winnerInventory = await Inventory.create({ userId: winner.userId, items: [] })
  }
  
  // Add all battle items to winner's inventory
  for (const item of battle.allItems) {
    winnerInventory.items.push(item)
  }
  await winnerInventory.save()
  
  // Update user statistics
  const totalBattleValue = battle.allItems.reduce((sum, item) => sum + item.price, 0)
  
  for (const player of battle.players) {
    const isWinner = player.userId === winner.userId
    const updateData = {
      $inc: {
        battlesPlayed: 1,
        battleWins: isWinner ? 1 : 0,
        casesOpened: battle.maxRounds
      },
      lastActive: new Date()
    }
    
    // Only winner gets the total value added
    if (isWinner) {
      updateData.$inc.totalValue = totalBattleValue
    }
    
    await User.findByIdAndUpdate(player.userId, updateData)
  }
  
  await battle.save()
  return battle
}

const Battle = mongoose.model('Battle', BattleSchema)
export default Battle