import express from 'express';
import {
  previewCSVFile,
  importCSVFile,
  uploadCSV,
} from '../controllers/csvImportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/preview', uploadCSV, previewCSVFile);
router.post('/import', uploadCSV, importCSVFile);

export default router;

