/**
 * AUTO CATEGORIZATION ENGINE
 * 
 * Rule-based categorization (NO AI) - maps merchants to categories
 */

/**
 * Category mapping rules
 */
const CATEGORY_RULES = {
  // Food & Dining
  'Food & Dining': {
    merchants: [
      'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza hut', 'mcdonalds', 'kfc',
      'starbucks', 'cafe coffee day', 'barista', 'subway', 'burger king',
    ],
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger', 'coffee'],
  },
  
  // Groceries
  'Groceries': {
    merchants: [
      'bigbasket', 'grofers', 'blinkit', 'dmart', 'reliance fresh', 'more', 'spencer',
    ],
    keywords: ['grocery', 'supermarket', 'mart', 'store'],
  },
  
  // Shopping
  'Shopping': {
    merchants: [
      'amazon', 'flipkart', 'myntra', 'nykaa', 'reliance digital', 'croma', 'vijay sales',
      'snapdeal', 'meesho', 'ajio',
    ],
    keywords: ['shopping', 'purchase', 'buy', 'order'],
  },
  
  // Transportation
  'Transportation': {
    merchants: [
      'uber', 'ola', 'rapido', 'zoomcar', 'revv',
    ],
    keywords: ['cab', 'taxi', 'ride', 'uber', 'ola'],
  },
  
  // Entertainment
  'Entertainment': {
    merchants: [
      'netflix', 'spotify', 'prime video', 'hotstar', 'youtube', 'bookmyshow', 'insider',
    ],
    keywords: ['movie', 'streaming', 'subscription', 'entertainment'],
  },
  
  // Bills & Utilities
  'Bills & Utilities': {
    merchants: [
      'airtel', 'jio', 'vodafone', 'bsnl', 'tata sky', 'dish tv', 'd2h',
      'bse', 'nse', 'electricity', 'water',
    ],
    keywords: ['bill', 'recharge', 'utility', 'electricity', 'water', 'gas'],
  },
  
  // Insurance
  'Insurance': {
    merchants: [
      'lic', 'hdfc life', 'icici prudential', 'sbi life', 'max life',
    ],
    keywords: ['insurance', 'premium', 'policy'],
  },
  
  // Healthcare
  'Healthcare': {
    merchants: [
      'apollo', 'fortis', 'max', 'medplus', '1mg', 'netmeds', 'practo',
    ],
    keywords: ['hospital', 'clinic', 'pharmacy', 'medicine', 'doctor'],
  },
  
  // Education
  'Education': {
    merchants: [
      'byju', 'unacademy', 'vedantu', 'coursera', 'udemy',
    ],
    keywords: ['education', 'course', 'tuition', 'school', 'college'],
  },
  
  // Personal Care
  'Personal Care': {
    merchants: [
      'nykaa', 'lenskart', 'titan', 'fastrack',
    ],
    keywords: ['beauty', 'salon', 'spa', 'gym', 'fitness'],
  },
  
  // Travel
  'Travel': {
    merchants: [
      'makemytrip', 'goibibo', 'cleartrip', 'irctc', 'indigo', 'spicejet', 'air india',
    ],
    keywords: ['flight', 'hotel', 'travel', 'booking'],
  },
  
  // Fuel
  'Fuel': {
    merchants: [
      'hp', 'ioc', 'bpcl', 'hpcl',
    ],
    keywords: ['petrol', 'diesel', 'fuel', 'gas station'],
  },
  
  // Banking & Finance
  'Banking & Finance': {
    merchants: [
      'paytm', 'phonepe', 'google pay', 'razorpay', 'cashfree',
    ],
    keywords: ['bank', 'transfer', 'payment', 'upi'],
  },
  
  // Subscriptions
  'Subscriptions': {
    merchants: [
      'netflix', 'spotify', 'prime video', 'hotstar', 'youtube', 'disney',
    ],
    keywords: ['subscription', 'renewal', 'premium'],
  },
  
  // Others (default)
  'Others': {
    merchants: [],
    keywords: [],
  },
};

/**
 * Categorize transaction based on merchant and description
 */
export const categorizeTransaction = async ({ merchant, amount, type, description }) => {
  const searchText = `${merchant || ''} ${description || ''}`.toLowerCase();
  
  // Check merchant match first (highest confidence)
  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    for (const merchantName of rules.merchants) {
      if (merchant && merchant.toLowerCase().includes(merchantName.toLowerCase())) {
        return {
          category,
          confidence: 0.9,
          method: 'merchant_match',
        };
      }
    }
  }
  
  // Check keyword match (medium confidence)
  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of rules.keywords) {
      if (searchText.includes(keyword)) {
        return {
          category,
          confidence: 0.7,
          method: 'keyword_match',
        };
      }
    }
  }
  
  // Default category based on type
  if (type === 'credit') {
    return {
      category: 'Income',
      confidence: 0.5,
      method: 'default_credit',
    };
  }
  
  // Default for debit
  return {
    category: 'Others',
    confidence: 0.3,
    method: 'default',
  };
};

/**
 * Learn from user correction
 */
export const learnFromCorrection = async (merchant, originalCategory, correctedCategory) => {
  // In production, store this in database for user-specific learning
  // For now, we can update rules dynamically
  if (!CATEGORY_RULES[correctedCategory]) {
    CATEGORY_RULES[correctedCategory] = { merchants: [], keywords: [] };
  }
  
  // Add merchant to corrected category if not already present
  const merchantLower = merchant.toLowerCase();
  if (!CATEGORY_RULES[correctedCategory].merchants.includes(merchantLower)) {
    CATEGORY_RULES[correctedCategory].merchants.push(merchantLower);
  }
};

