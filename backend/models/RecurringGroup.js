import mongoose from 'mongoose';

/**
 * Recurring Transaction Group
 * Groups similar recurring transactions together
 */
const recurringGroupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  merchantNormalized: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  
  category: {
    type: String,
    trim: true,
  },
  
  // Recurring pattern
  averageAmount: {
    type: Number,
    required: true,
  },
  amountVariance: {
    type: Number,
    default: 0, // ± percentage
  },
  
  interval: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  
  lastTransactionDate: {
    type: Date,
  },
  nextExpectedDate: {
    type: Date,
  },
  
  // Statistics
  transactionCount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
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

recurringGroupSchema.index({ userId: 1, isActive: 1 });
recurringGroupSchema.index({ userId: 1, merchantNormalized: 1 });

recurringGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RecurringGroup = mongoose.model('RecurringGroup', recurringGroupSchema);

export default RecurringGroup;

