import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assetType: {
    type: String,
    enum: ['stock', 'mf', 'crypto', 'gold', 'silver'],
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  buyDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  broker: {
    type: String,
    trim: true,
    default: '',
  },
  investedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
holdingSchema.index({ userId: 1, assetType: 1 });
holdingSchema.index({ userId: 1, createdAt: -1 });
holdingSchema.index({ userId: 1, symbol: 1 });

// Update updatedAt before saving
holdingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Calculate investedAmount if not provided
  if (!this.investedAmount && this.quantity && this.buyPrice) {
    this.investedAmount = this.quantity * this.buyPrice;
  }
  next();
});

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;

