import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  steamId: { type: String, required: true, unique: true },
  username: String,
  avatar: String,
  totalValue: { type: Number, default: 0 },
  casesOpened: { type: Number, default: 0 },
  battlesPlayed: { type: Number, default: 0 },
  battleWins: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
})
const User = mongoose.model('User', UserSchema)
export default User