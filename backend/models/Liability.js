import mongoose from 'mongoose';

const liabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['loan', 'credit_card', 'other'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
  },
  dueDate: {
    type: Date,
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

liabilitySchema.index({ userId: 1, type: 1 });
liabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Liability = mongoose.model('Liability', liabilitySchema);

export default Liability;

