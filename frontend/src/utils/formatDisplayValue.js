/**
 * Global formatter utility for displaying financial values
 * Formats numbers for display only - does NOT modify calculations or stored values
 * 
 * Rules:
 * - Income, Savings, Balances: >= 1,00,000 → ₹L (Lakhs)
 * - Expenses & Spend: >= 1,000 → ₹K (Thousands)
 * - Below thresholds → normal ₹ value
 * - Max 1 decimal place, remove trailing .0
 */

/**
 * Format income, savings, or balance values
 * @param {number|null|undefined} value - The value to format
 * @returns {string} Formatted string with ₹ prefix
 */
export const formatIncome = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }

  const numValue = parseFloat(value);
  
  if (numValue >= 100000) {
    const lakhs = (numValue / 100000).toFixed(1);
    return `₹${lakhs.replace(/\.0$/, '')}L`;
  }
  
  return `₹${numValue.toFixed(2).replace(/\.00$/, '')}`;
};

/**
 * Format expense or spending values
 * @param {number|null|undefined} value - The value to format
 * @returns {string} Formatted string with ₹ prefix
 */
export const formatExpense = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }

  const numValue = parseFloat(value);
  
  if (numValue >= 1000) {
    const thousands = (numValue / 1000).toFixed(1);
    return `₹${thousands.replace(/\.0$/, '')}K`;
  }
  
  return `₹${numValue.toFixed(2).replace(/\.00$/, '')}`;
};

/**
 * Smart formatter that chooses format based on context
 * For general use when type is unknown
 * @param {number|null|undefined} value - The value to format
 * @param {string} type - 'income' | 'expense' | 'balance' | 'spending'
 * @returns {string} Formatted string with ₹ prefix
 */
export const formatDisplayValue = (value, type = 'expense') => {
  if (type === 'income' || type === 'balance' || type === 'savings') {
    return formatIncome(value);
  }
  return formatExpense(value);
};










