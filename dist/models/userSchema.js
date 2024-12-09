const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin']
  },
  cart: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('User', userSchema);