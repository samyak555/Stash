/**
 * TRANSACTION NORMALIZER
 * 
 * Normalizes raw transaction data from various sources into a consistent format
 */

/**
 * Normalize transaction data from any source
 */
export const normalizeTransaction = async (rawData, source) => {
  const normalized = {
    source,
    amount: null,
    type: null,
    transactionDate: null,
    merchantRawText: null,
    description: null,
    accountType: 'bank',
    accountLast4: null,
    bankName: null,
    referenceId: null,
    note: null,
  };
  
  // Normalize based on source
  switch (source) {
    case 'manual':
      return normalizeManual(rawData);
    case 'csv':
      return normalizeCSV(rawData);
    case 'sms':
      return normalizeSMS(rawData);
    case 'email':
      return normalizeEmail(rawData);
    case 'aa':
      return normalizeAA(rawData);
    default:
      return normalizeGeneric(rawData);
  }
};

/**
 * Normalize manual entry
 */
const normalizeManual = (data) => {
  return {
    source: 'manual',
    amount: parseFloat(data.amount) || 0,
    type: data.type === 'expense' ? 'debit' : data.type === 'income' ? 'credit' : data.type || 'debit',
    transactionDate: data.date ? new Date(data.date) : new Date(),
    merchantRawText: data.merchant || data.description || '',
    description: data.description || data.note || '',
    accountType: data.accountType || 'bank',
    note: data.note || '',
  };
};

/**
 * Normalize CSV data
 */
const normalizeCSV = (data) => {
  // CSV data should already be parsed by CSV parser
  return {
    source: 'csv',
    amount: parseFloat(data.amount) || parseFloat(data.debit) || parseFloat(data.credit) || 0,
    type: determineTypeFromCSV(data),
    transactionDate: parseDate(data.date || data.transactionDate || data.transaction_date),
    merchantRawText: data.description || data.merchant || data.narration || data.remarks || '',
    description: data.description || data.narration || data.remarks || '',
    accountType: inferAccountType(data),
    accountLast4: extractLast4(data.account || data.card || ''),
    bankName: extractBankName(data.bank || data.bankName || ''),
    referenceId: data.reference || data.refNo || data.transactionId || null,
  };
};

/**
 * Normalize SMS data
 */
const normalizeSMS = (data) => {
  return {
    source: 'sms',
    amount: parseAmountFromText(data.text || data.body || ''),
    type: determineTypeFromSMS(data.text || data.body || ''),
    transactionDate: data.timestamp ? new Date(data.timestamp) : new Date(),
    merchantRawText: extractMerchantFromSMS(data.text || data.body || ''),
    description: data.text || data.body || '',
    accountType: inferAccountTypeFromSMS(data.text || data.body || ''),
    accountLast4: extractLast4FromSMS(data.text || data.body || ''),
    bankName: extractBankNameFromSMS(data.text || data.body || ''),
    referenceId: extractReferenceFromSMS(data.text || data.body || ''),
  };
};

/**
 * Normalize email data
 */
const normalizeEmail = (data) => {
  const text = `${data.subject || ''} ${data.body || ''}`;
  return {
    source: 'email',
    amount: parseAmountFromText(text),
    type: determineTypeFromEmail(text),
    transactionDate: data.date ? new Date(data.date) : new Date(),
    merchantRawText: extractMerchantFromEmail(text),
    description: text,
    accountType: inferAccountTypeFromEmail(text),
    accountLast4: extractLast4FromSMS(text),
    bankName: extractBankNameFromSMS(text),
    referenceId: extractReferenceFromSMS(text),
  };
};

/**
 * Normalize Account Aggregator data
 */
const normalizeAA = (data) => {
  return {
    source: 'aa',
    amount: parseFloat(data.amount) || 0,
    type: data.type === 'DEBIT' ? 'debit' : 'credit',
    transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
    merchantRawText: data.description || data.merchant || '',
    description: data.description || '',
    accountType: data.accountType || 'bank',
    accountLast4: data.maskedAccountNumber ? data.maskedAccountNumber.slice(-4) : null,
    bankName: data.bankName || '',
    referenceId: data.transactionId || data.referenceNumber || null,
  };
};

/**
 * Generic normalizer (fallback)
 */
const normalizeGeneric = (data) => {
  return {
    source: 'manual',
    amount: parseFloat(data.amount) || 0,
    type: data.type || 'debit',
    transactionDate: data.date ? new Date(data.date) : new Date(),
    merchantRawText: data.merchant || data.description || '',
    description: data.description || '',
  };
};

// Helper functions

const determineTypeFromCSV = (data) => {
  const amount = parseFloat(data.amount) || 0;
  const debit = parseFloat(data.debit) || 0;
  const credit = parseFloat(data.credit) || 0;
  
  if (debit > 0) return 'debit';
  if (credit > 0) return 'credit';
  if (data.type) {
    const type = data.type.toLowerCase();
    if (type.includes('debit') || type.includes('dr')) return 'debit';
    if (type.includes('credit') || type.includes('cr')) return 'credit';
  }
  return amount < 0 ? 'debit' : 'credit';
};

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  
  // Try various date formats
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/,   // YYYY-MM-DD
    /(\d{2})-(\d{2})-(\d{4})/,   // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0]) {
        // DD/MM/YYYY
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      } else if (format === formats[1]) {
        // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        // DD-MM-YYYY
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }
  
  // Fallback to Date constructor
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

const parseAmountFromText = (text) => {
  // Match Indian currency formats: ₹1,299.00, INR 5000, Rs. 1000
  const patterns = [
    /₹\s*([\d,]+\.?\d*)/,
    /INR\s*([\d,]+\.?\d*)/,
    /Rs\.?\s*([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*(?:rupees?|rs)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  
  return 0;
};

const determineTypeFromSMS = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('credited') || lowerText.includes('credit') || lowerText.includes('received')) {
    return 'credit';
  }
  if (lowerText.includes('debited') || lowerText.includes('debit') || lowerText.includes('spent') || lowerText.includes('paid')) {
    return 'debit';
  }
  return 'debit'; // Default
};

const extractMerchantFromSMS = (text) => {
  // Extract merchant name from SMS patterns
  const patterns = [
    /(?:spent|paid|at|from)\s+([A-Z][A-Z\s]+?)(?:\s+using|\s+via|$)/i,
    /(?:merchant|vendor):\s*([A-Z][A-Z\s]+?)(?:\s|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return '';
};

const extractMerchantFromEmail = (text) => {
  // Similar to SMS but for email patterns
  return extractMerchantFromSMS(text);
};

const inferAccountType = (data) => {
  const text = `${data.accountType || ''} ${data.card || ''} ${data.wallet || ''}`.toLowerCase();
  if (text.includes('credit') || text.includes('card')) return 'credit_card';
  if (text.includes('wallet')) return 'wallet';
  return 'bank';
};

const inferAccountTypeFromSMS = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('credit card') || lowerText.includes('card')) return 'credit_card';
  if (lowerText.includes('wallet')) return 'wallet';
  return 'bank';
};

const inferAccountTypeFromEmail = (text) => {
  return inferAccountTypeFromSMS(text);
};

const extractLast4 = (text) => {
  if (!text) return null;
  const match = text.match(/(\d{4})$/);
  return match ? match[1] : null;
};

const extractLast4FromSMS = (text) => {
  // Match patterns like XXXX1234, Card ending 1234
  const patterns = [
    /(?:XXXX|card|account).*?(\d{4})/i,
    /(\d{4})(?:\s|$)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

const extractBankNameFromSMS = (text) => {
  const banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOI', 'Canara', 'Union', 'IDBI'];
  const upperText = text.toUpperCase();
  
  for (const bank of banks) {
    if (upperText.includes(bank)) {
      return bank;
    }
  }
  
  return null;
};

const extractReferenceFromSMS = (text) => {
  // Extract reference numbers
  const patterns = [
    /(?:ref|reference|txn|transaction)[\s:]*([A-Z0-9]{8,})/i,
    /([A-Z0-9]{10,})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

const determineTypeFromEmail = (text) => {
  return determineTypeFromSMS(text);
};

