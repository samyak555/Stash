import mongoose from 'mongoose';

/**
 * Auto-Tracking Transaction Model
 * Supports all transaction sources: manual, CSV, SMS, email, AA
 */
const autoTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Core transaction data
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true,
    index: true,
  },
  
  // Source tracking
  source: {
    type: String,
    enum: ['manual', 'csv', 'sms', 'email', 'aa'],
    default: 'manual',
    required: true,
    index: true,
  },
  
  // Merchant information
  merchantRawText: {
    type: String,
    trim: true,
    index: true,
  },
  merchantNormalized: {
    type: String,
    trim: true,
    index: true,
  },
  
  // Categorization
  category: {
    type: String,
    trim: true,
    index: true,
  },
  categoryConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  
  // Account information
  accountType: {
    type: String,
    enum: ['bank', 'credit_card', 'wallet', 'other'],
    default: 'bank',
  },
  accountLast4: {
    type: String,
    maxlength: 4,
  },
  bankName: {
    type: String,
    trim: true,
  },
  
  // Transaction metadata
  referenceId: {
    type: String,
    trim: true,
    index: true,
  },
  transactionDate: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Recurring detection
  isRecurring: {
    type: Boolean,
    default: false,
    index: true,
  },
  recurringGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringGroup',
    default: null,
    index: true,
  },
  
  // Confidence and quality
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  
  // Additional metadata
  description: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  
  // User corrections (for learning)
  userCorrectedCategory: {
    type: String,
    trim: true,
  },
  userCorrectedMerchant: {
    type: String,
    trim: true,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // Duplicate prevention
  duplicateHash: {
    type: String,
    index: true,
  },
});

// Compound indexes for performance
autoTransactionSchema.index({ userId: 1, transactionDate: -1 });
autoTransactionSchema.index({ userId: 1, type: 1, transactionDate: -1 });
autoTransactionSchema.index({ userId: 1, category: 1, transactionDate: -1 });
autoTransactionSchema.index({ userId: 1, merchantNormalized: 1 });
autoTransactionSchema.index({ userId: 1, isRecurring: 1, recurringGroupId: 1 });
autoTransactionSchema.index({ duplicateHash: 1 });

// Update updatedAt before saving
autoTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate duplicate hash for duplicate detection
autoTransactionSchema.methods.generateDuplicateHash = function() {
  const crypto = require('crypto');
  const hashString = `${this.userId}_${this.amount}_${this.type}_${this.transactionDate.toISOString().split('T')[0]}_${this.merchantNormalized || this.merchantRawText || ''}_${this.referenceId || ''}`;
  return crypto.createHash('sha256').update(hashString).digest('hex');
};

const AutoTransaction = mongoose.model('AutoTransaction', autoTransactionSchema);

export default AutoTransaction;

