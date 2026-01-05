/**
 * CSV IMPORT CONTROLLER (PHASE 1)
 * 
 * Handles CSV/Statement import with preview and auto-detection
 */

import multer from 'multer';
import { previewCSV, importCSVTransactions } from '../services/csvImportService.js';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

/**
 * Preview CSV before import
 */
export const previewCSVFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }
    
    const preview = await previewCSV(req.file.buffer);
    
    res.json({
      success: true,
      ...preview,
    });
  } catch (error) {
    console.error('CSV preview error:', error);
    res.status(500).json({
      success: false,
      message: `Preview failed: ${error.message}`,
      headers: [],
      rows: [],
      totalRows: 0,
      detectedColumns: {},
    });
  }
};

/**
 * Import CSV transactions
 */
export const importCSVFile = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }
    
    const { columnMapping } = req.body;
    const mapping = columnMapping ? JSON.parse(columnMapping) : null;
    
    const result = await importCSVTransactions(req.file.buffer, userId, mapping);
    
    res.json(result);
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: `Import failed: ${error.message}`,
      processed: 0,
      duplicates: 0,
      errors: 0,
    });
  }
};

// Export multer middleware
export const uploadCSV = upload.single('csvFile');

