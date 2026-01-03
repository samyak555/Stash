import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  deadline: {
    type: Date,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
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
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

// Update updatedAt before saving
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;

