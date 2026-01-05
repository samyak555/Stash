/**
 * CSV IMPORT SERVICE (PHASE 1)
 * 
 * Handles CSV/Statement import with auto-detection of columns
 * NEVER crashes even if format is inconsistent
 */

import csv from 'csv-parser';
import { Readable } from 'stream';
import { processTransaction } from './transactionPipeline.js';

/**
 * Auto-detect CSV columns
 */
const detectColumns = (headers, sampleRow) => {
  const detected = {
    date: null,
    description: null,
    amount: null,
    debit: null,
    credit: null,
    type: null,
    reference: null,
    account: null,
  };
  
  const headerLower = headers.map(h => (h || '').toLowerCase().trim());
  
  // Date detection
  const datePatterns = ['date', 'transaction date', 'txn date', 'value date', 'posting date'];
  for (const pattern of datePatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.date = headers[index];
      break;
    }
  }
  
  // Description detection
  const descPatterns = ['description', 'narration', 'remarks', 'particulars', 'details', 'merchant'];
  for (const pattern of descPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.description = headers[index];
      break;
    }
  }
  
  // Amount detection
  const amountPatterns = ['amount', 'transaction amount', 'txn amount'];
  for (const pattern of amountPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.amount = headers[index];
      break;
    }
  }
  
  // Debit detection
  const debitPatterns = ['debit', 'withdrawal', 'dr', 'paid'];
  for (const pattern of debitPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.debit = headers[index];
      break;
    }
  }
  
  // Credit detection
  const creditPatterns = ['credit', 'deposit', 'cr', 'received'];
  for (const pattern of creditPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.credit = headers[index];
      break;
    }
  }
  
  // Reference detection
  const refPatterns = ['reference', 'ref', 'ref no', 'transaction id', 'txn id'];
  for (const pattern of refPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.reference = headers[index];
      break;
    }
  }
  
  // Account detection
  const accountPatterns = ['account', 'account number', 'card', 'account no'];
  for (const pattern of accountPatterns) {
    const index = headerLower.findIndex(h => h.includes(pattern));
    if (index !== -1) {
      detected.account = headers[index];
      break;
    }
  }
  
  return detected;
};

/**
 * Parse CSV file
 */
export const parseCSV = async (csvBuffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(csvBuffer);
    
    stream
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Preview CSV data (first 10 rows)
 */
export const previewCSV = async (csvBuffer) => {
  try {
    const allRows = await parseCSV(csvBuffer);
    const previewRows = allRows.slice(0, 10);
    
    if (allRows.length === 0) {
      return {
        headers: [],
        rows: [],
        totalRows: 0,
        detectedColumns: {},
      };
    }
    
    const headers = Object.keys(allRows[0]);
    const detectedColumns = detectColumns(headers, allRows[0]);
    
    return {
      headers,
      rows: previewRows,
      totalRows: allRows.length,
      detectedColumns,
    };
  } catch (error) {
    console.error('CSV preview error:', error);
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      detectedColumns: {},
      error: error.message,
    };
  }
};

/**
 * Import CSV transactions
 */
export const importCSVTransactions = async (csvBuffer, userId, columnMapping = null) => {
  try {
    const allRows = await parseCSV(csvBuffer);
    
    if (allRows.length === 0) {
      return {
        success: false,
        message: 'CSV file is empty',
        processed: 0,
        duplicates: 0,
        errors: 0,
      };
    }
    
    // Auto-detect columns if mapping not provided
    const headers = Object.keys(allRows[0]);
    const detectedColumns = columnMapping || detectColumns(headers, allRows[0]);
    
    const results = {
      processed: 0,
      duplicates: 0,
      errors: 0,
      transactions: [],
    };
    
    // Process each row
    for (const row of allRows) {
      try {
        // Build transaction data from row
        const transactionData = {
          date: row[detectedColumns.date] || null,
          amount: row[detectedColumns.amount] || row[detectedColumns.debit] || row[detectedColumns.credit] || null,
          debit: row[detectedColumns.debit] || null,
          credit: row[detectedColumns.credit] || null,
          description: row[detectedColumns.description] || '',
          reference: row[detectedColumns.reference] || null,
          account: row[detectedColumns.account] || null,
        };
        
        // Skip empty rows
        if (!transactionData.date && !transactionData.amount) {
          continue;
        }
        
        // Process through pipeline
        const result = await processTransaction(transactionData, userId, 'csv');
        
        if (result.isDuplicate) {
          results.duplicates++;
        } else {
          results.processed++;
          results.transactions.push(result.transaction);
        }
      } catch (error) {
        console.error('Row processing error:', error);
        results.errors++;
      }
    }
    
    return {
      success: true,
      message: `Imported ${results.processed} transactions`,
      ...results,
    };
  } catch (error) {
    console.error('CSV import error:', error);
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      processed: 0,
      duplicates: 0,
      errors: 0,
    };
  }
};

