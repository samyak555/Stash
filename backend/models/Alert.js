import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['price_movement', 'budget_exceeded', 'net_worth_change', 'custom'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  config: {
    // For price_movement: { symbol, threshold, direction }
    // For budget_exceeded: { budgetId, threshold }
    // For net_worth_change: { threshold, direction }
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
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

alertSchema.index({ userId: 1, isActive: 1, isRead: 1 });
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;

