const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  items: [
    {
      name: {
        type: String,
        trim: true,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const model = mongoose.model("Order", Schema);

module.exports = model;
