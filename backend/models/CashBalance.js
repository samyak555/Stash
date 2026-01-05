import mongoose from 'mongoose';

const cashBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ['savings', 'current', 'cash', 'other'],
    default: 'savings',
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  notes: {
    type: String,
    trim: true,
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

cashBalanceSchema.index({ userId: 1 });
cashBalanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CashBalance = mongoose.model('CashBalance', cashBalanceSchema);

export default CashBalance;

