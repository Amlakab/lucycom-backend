import express from 'express';
import {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  updateTransactionStatus,
  getWalletStatistics,
  getFilterOptions,
  exportTransactions,
  getDailyStatistics,      // Add this
  getWeeklyStatistics,     // Add this
  getMonthlyStatistics,    // Add this
  exportToPDF             // Add this
} from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes (if any)
router.get('/filter-options', authenticate, getFilterOptions);

// Analytics routes
router.get('/stats/daily', authenticate, getDailyStatistics);
router.get('/stats/weekly', authenticate, getWeeklyStatistics);
router.get('/stats/monthly', authenticate, getMonthlyStatistics);
router.get('/stats', authenticate, getWalletStatistics);

// Export routes
router.get('/export', authenticate, exportTransactions);
router.get('/export/pdf', authenticate, exportToPDF);

// Transaction CRUD routes
router.get('/', authenticate, getAllTransactions);
router.get('/:id', authenticate, getTransaction);
router.post('/', authenticate, createTransaction);
router.put('/:id', authenticate, updateTransaction);
router.patch('/:id/status', authenticate, updateTransactionStatus);
router.delete('/:id', authenticate, deleteTransaction);

export default router;