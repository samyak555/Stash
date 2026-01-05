/**
 * TRANSACTION PROCESSING PIPELINE
 * 
 * All transactions must pass through this pipeline:
 * RAW INPUT → NORMALIZATION → MERCHANT DETECTION → AUTO CATEGORIZATION 
 * → RECURRING DETECTION → INSIGHTS ENGINE → ALERTS/REPORTS
 */

import crypto from 'crypto';
import AutoTransaction from '../models/AutoTransaction.js';
import { normalizeTransaction } from './transactionNormalizer.js';
import { detectMerchant } from './merchantDetectionEngine.js';
import { categorizeTransaction } from './categorizationEngine.js';
import { detectRecurring } from './recurringDetectionService.js';

/**
 * Process a raw transaction through the complete pipeline
 * @param {Object} rawTransaction - Raw transaction data
 * @param {string} userId - User ID
 * @param {string} source - Source of transaction (manual, csv, sms, email, aa)
 * @returns {Promise<Object>} - Processed transaction
 */
export const processTransaction = async (rawTransaction, userId, source = 'manual') => {
  try {
    // Step 1: Normalize raw input
    const normalized = await normalizeTransaction(rawTransaction, source);
    
    // Step 2: Merchant Detection
    const merchantData = await detectMerchant(normalized.merchantRawText || normalized.description || '');
    
    // Step 3: Auto Categorization
    const categoryData = await categorizeTransaction({
      merchant: merchantData.normalized,
      amount: normalized.amount,
      type: normalized.type,
      description: normalized.description,
    });
    
    // Step 4: Build transaction object
    const transactionData = {
      userId,
      amount: normalized.amount,
      type: normalized.type,
      source,
      merchantRawText: normalized.merchantRawText || normalized.description || '',
      merchantNormalized: merchantData.normalized,
      category: categoryData.category,
      categoryConfidence: categoryData.confidence,
      accountType: normalized.accountType || 'bank',
      accountLast4: normalized.accountLast4,
      bankName: normalized.bankName,
      referenceId: normalized.referenceId,
      transactionDate: normalized.transactionDate || new Date(),
      description: normalized.description,
      note: normalized.note,
      confidenceScore: calculateConfidenceScore(normalized, merchantData, categoryData),
    };
    
    // Step 5: Generate duplicate hash
    const hashString = `${userId}_${transactionData.amount}_${transactionData.type}_${transactionData.transactionDate.toISOString().split('T')[0]}_${transactionData.merchantNormalized || transactionData.merchantRawText || ''}_${transactionData.referenceId || ''}`;
    transactionData.duplicateHash = crypto.createHash('sha256').update(hashString).digest('hex');
    
    // Step 6: Check for duplicates
    const existing = await AutoTransaction.findOne({ 
      userId, 
      duplicateHash: transactionData.duplicateHash 
    });
    
    if (existing) {
      return {
        transaction: existing,
        isDuplicate: true,
        message: 'Duplicate transaction detected',
      };
    }
    
    // Step 7: Create transaction
    const transaction = new AutoTransaction(transactionData);
    await transaction.save();
    
    // Step 8: Recurring Detection (async, non-blocking)
    detectRecurring(transaction).catch(err => {
      console.error('Recurring detection error:', err);
    });
    
    return {
      transaction,
      isDuplicate: false,
      message: 'Transaction processed successfully',
    };
  } catch (error) {
    console.error('Transaction pipeline error:', error);
    throw new Error(`Transaction processing failed: ${error.message}`);
  }
};

/**
 * Process multiple transactions in batch
 */
export const processBatchTransactions = async (rawTransactions, userId, source = 'csv') => {
  const results = {
    processed: 0,
    duplicates: 0,
    errors: 0,
    transactions: [],
  };
  
  for (const rawTx of rawTransactions) {
    try {
      const result = await processTransaction(rawTx, userId, source);
      if (result.isDuplicate) {
        results.duplicates++;
      } else {
        results.processed++;
        results.transactions.push(result.transaction);
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      results.errors++;
    }
  }
  
  return results;
};

/**
 * Calculate overall confidence score
 */
const calculateConfidenceScore = (normalized, merchantData, categoryData) => {
  let score = 0.5; // Base score
  
  // Merchant detection confidence
  if (merchantData.confidence) {
    score = (score + merchantData.confidence) / 2;
  }
  
  // Category confidence
  if (categoryData.confidence) {
    score = (score + categoryData.confidence) / 2;
  }
  
  // Source confidence
  const sourceConfidence = {
    manual: 1.0,
    csv: 0.9,
    sms: 0.8,
    email: 0.7,
    aa: 0.95,
  };
  
  const sourceScore = sourceConfidence[normalized.source] || 0.5;
  score = (score + sourceScore) / 2;
  
  // Reference ID presence increases confidence
  if (normalized.referenceId) {
    score = Math.min(1.0, score + 0.1);
  }
  
  return Math.round(score * 100) / 100; // Round to 2 decimal places
};

