import mongoose from 'mongoose'
const InventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      name: String,
      image: String,
      price: Number,
      case: String,
    }
  ]
})
const Inventory = mongoose.model('Inventory', InventorySchema)
export default Inventory 