/**
 * MERCHANT DETECTION ENGINE
 * 
 * Cleans and normalizes merchant names using dictionary matching and fuzzy matching
 */

import Fuse from 'fuse.js';

/**
 * Indian Merchant Dictionary
 * Maps common merchant name variations to normalized names
 */
const MERCHANT_DICTIONARY = {
  // Food & Delivery
  'swiggy': ['swiggy', 'swiggy instamart', 'swiggy instamart blr', 'swiggy food'],
  'zomato': ['zomato', 'zomato gold', 'zomato pro'],
  'uber eats': ['uber eats', 'ubereats'],
  'dominos': ['dominos', 'dominos pizza', 'domino\'s'],
  'pizza hut': ['pizza hut'],
  'mcdonalds': ['mcdonalds', 'mcd', 'mcdonald\'s'],
  'kfc': ['kfc', 'kentucky fried chicken'],
  
  // E-commerce
  'amazon': ['amazon', 'amzn', 'amzn pay', 'amazon pay', 'amazon.in', 'amazon pay india'],
  'flipkart': ['flipkart', 'flipkart.com'],
  'myntra': ['myntra', 'myntra.com'],
  'nykaa': ['nykaa', 'nykaa.com'],
  
  // Grocery
  'bigbasket': ['bigbasket', 'big basket', 'bb'],
  'grofers': ['grofers', 'blinkit'],
  'dmart': ['dmart', 'd mart'],
  
  // Transportation
  'uber': ['uber', 'uber india'],
  'ola': ['ola', 'ola cabs', 'ola money'],
  'rapido': ['rapido'],
  
  // Entertainment & Subscriptions
  'netflix': ['netflix', 'netflix.com'],
  'spotify': ['spotify', 'spotify premium'],
  'prime video': ['prime video', 'amazon prime'],
  'hotstar': ['hotstar', 'disney+ hotstar'],
  'youtube': ['youtube', 'youtube premium'],
  
  // Utilities
  'airtel': ['airtel', 'airtel payments', 'airtel digital'],
  'jio': ['jio', 'reliance jio'],
  'vodafone': ['vodafone', 'vi', 'vodafone idea'],
  'bsnl': ['bsnl'],
  
  // Insurance
  'lic': ['lic', 'life insurance corporation'],
  'hdfc life': ['hdfc life', 'hdfc life insurance'],
  'icici prudential': ['icici prudential', 'icici prudential life'],
  
  // Banking & Finance
  'paytm': ['paytm', 'paytm payments'],
  'phonepe': ['phonepe', 'phonepe payments'],
  'google pay': ['google pay', 'gpay', 'tez'],
  'razorpay': ['razorpay'],
  'cashfree': ['cashfree'],
  
  // Fuel
  'hp': ['hp', 'hpcl', 'hp petrol'],
  'ioc': ['ioc', 'indian oil', 'indian oil corporation'],
  'bpcl': ['bpcl', 'bharat petroleum'],
  
  // Retail
  'reliance': ['reliance', 'reliance digital', 'reliance fresh', 'reliance trends'],
  'dmart': ['dmart', 'd mart'],
  'croma': ['croma', 'croma retail'],
  'vijay sales': ['vijay sales'],
};

/**
 * Clean merchant text
 */
const cleanMerchantText = (text) => {
  if (!text) return '';
  
  // Convert to uppercase for consistency
  let cleaned = text.toUpperCase().trim();
  
  // Remove common prefixes/suffixes
  cleaned = cleaned
    .replace(/^(PAYMENT|TXN|TRANSACTION|DEBIT|CREDIT)\s+/i, '')
    .replace(/\s+(PAYMENT|TXN|TRANSACTION)$/i, '')
    .replace(/^UPI\s+/i, '')
    .replace(/\s+UPI$/i, '');
  
  // Remove special characters but keep spaces
  cleaned = cleaned.replace(/[^\w\s]/g, ' ');
  
  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

/**
 * Detect and normalize merchant name
 */
export const detectMerchant = async (rawText) => {
  if (!rawText || rawText.trim().length === 0) {
    return {
      normalized: '',
      confidence: 0,
      original: rawText || '',
    };
  }
  
  const cleaned = cleanMerchantText(rawText);
  
  // Exact match in dictionary
  for (const [normalized, variations] of Object.entries(MERCHANT_DICTIONARY)) {
    for (const variation of variations) {
      if (cleaned === variation.toUpperCase()) {
        return {
          normalized: normalized.charAt(0).toUpperCase() + normalized.slice(1),
          confidence: 1.0,
          original: rawText,
        };
      }
    }
  }
  
  // Fuzzy matching
  const options = {
    keys: ['name'],
    threshold: 0.4, // Lower threshold = more strict
    includeScore: true,
  };
  
  // Create searchable array
  const searchableArray = [];
  for (const [normalized, variations] of Object.entries(MERCHANT_DICTIONARY)) {
    for (const variation of variations) {
      searchableArray.push({ name: variation, normalized });
    }
  }
  
  const fuse = new Fuse(searchableArray, options);
  const results = fuse.search(cleaned);
  
  if (results.length > 0 && results[0].score < 0.4) {
    const bestMatch = results[0];
    const normalized = bestMatch.item.normalized;
    const confidence = 1 - bestMatch.score; // Convert distance to confidence
    
    return {
      normalized: normalized.charAt(0).toUpperCase() + normalized.slice(1),
      confidence: Math.round(confidence * 100) / 100,
      original: rawText,
    };
  }
  
  // No match found - return cleaned version
  return {
    normalized: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
    confidence: 0.3,
    original: rawText,
  };
};

/**
 * Add custom merchant mapping (for user corrections)
 */
export const addMerchantMapping = (rawText, normalizedName) => {
  // In production, this would be stored in database per user
  // For now, we'll add to in-memory dictionary
  if (!MERCHANT_DICTIONARY[normalizedName.toLowerCase()]) {
    MERCHANT_DICTIONARY[normalizedName.toLowerCase()] = [];
  }
  MERCHANT_DICTIONARY[normalizedName.toLowerCase()].push(rawText.toLowerCase());
};

