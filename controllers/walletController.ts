import { Request, Response } from 'express';
import WalletTransaction, { IWalletTransaction } from '../models/Wallet';
import mongoose from 'mongoose';

// Helper functions
const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res: Response, message: string = 'Error', statusCode: number = 500) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

// Get all wallet transactions with pagination and filtering
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const type = req.query.type as string || '';
    const category = req.query.category as string || '';
    const status = req.query.status as string || '';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = req.query.sortBy as string || '-date';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    // Add user filter (if needed for user-specific transactions)
    if (req.user) {
      filter.createdBy = req.user._id;
    }
    
    if (search) {
      filter.$or = [
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const transactions = await WalletTransaction.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalTransactions = await WalletTransaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    // Calculate summary statistics
    const summary = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summaryData = summary[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0
    };

    successResponse(res, {
      transactions,
      summary: {
        ...summaryData,
        balance: summaryData.totalIncome - summaryData.totalExpense
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Transactions retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get single transaction
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return errorResponse(res, 'Transaction ID is required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid transaction ID', 400);
    }

    const transaction = await WalletTransaction.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    successResponse(res, transaction, 'Transaction retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    errorResponse(res, error.message, 500);
  }
};

// Create new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      date,
      type,
      category,
      source,
      amount,
      description,
      status
    } = req.body;

    // Validate required fields
    if (!type || !category || !source || !amount) {
      return errorResponse(res, 'Type, category, source, and amount are required', 400);
    }

    if (amount <= 0) {
      return errorResponse(res, 'Amount must be greater than 0', 400);
    }

    // Get user ID from request (assuming you have authentication middleware)
    const userId = req.user?._id;
    if (!userId) {
      return errorResponse(res, 'User authentication required', 401);
    }

    const newTransaction = new WalletTransaction({
      date: date ? new Date(date) : new Date(),
      type,
      category,
      source,
      amount: parseFloat(amount),
      description,
      status: status || 'CONFIRMED',
      createdBy: userId
    });

    await newTransaction.save();
    
    // Populate createdBy field
    const populatedTransaction = await WalletTransaction.findById(newTransaction._id)
      .populate('createdBy', 'firstName lastName email');
    
    successResponse(res, populatedTransaction, 'Transaction created successfully', 201);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
};

// Update transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid transaction ID', 400);
    }

    const transaction = await WalletTransaction.findById(id);
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is authorized to update (if needed)
    if (req.user && transaction.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this transaction', 403);
    }

    // Validate amount if provided
    if (req.body.amount && req.body.amount <= 0) {
      return errorResponse(res, 'Amount must be greater than 0', 400);
    }

    // Update date if provided
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    const updatedTransaction = await WalletTransaction.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    successResponse(res, updatedTransaction, 'Transaction updated successfully');
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
};

// Update transaction status
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['CONFIRMED', 'PENDING', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid transaction ID', 400);
    }

    const transaction = await WalletTransaction.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    successResponse(res, transaction, `Transaction status updated to ${status}`);
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

// Delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid transaction ID', 400);
    }

    const transaction = await WalletTransaction.findById(id);
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    // Check if user is authorized to delete (if needed)
    if (req.user && transaction.createdBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this transaction', 403);
    }

    await WalletTransaction.findByIdAndDelete(id);

    successResponse(res, null, 'Transaction deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

// Get wallet statistics
export const getWalletStatistics = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const type = req.query.type as string;

    // Build filter object
    const filter: any = {};
    
    if (req.user) {
      filter.createdBy = req.user._id;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get total statistics
    const totalStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Get monthly statistics
    const monthlyStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get category statistics
    const categoryStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          type: { $first: '$type' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get source statistics
    const sourceStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    // Get daily statistics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = await WalletTransaction.aggregate([
      { 
        $match: { 
          ...filter,
          date: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const totalData = totalStats[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0
    };

    successResponse(res, {
      summary: {
        ...totalData,
        balance: totalData.totalIncome - totalData.totalExpense
      },
      monthlyStats,
      categoryStats,
      sourceStats,
      dailyStats
    }, 'Wallet statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching wallet statistics:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get unique filter options
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    
    if (req.user) {
      filter.createdBy = req.user._id;
    }

    const categories = await WalletTransaction.distinct('category', filter);
    const sources = await WalletTransaction.distinct('source', filter);
    const types = ['INCOME', 'EXPENSE'];
    const statuses = ['CONFIRMED', 'PENDING', 'CANCELLED'];

    successResponse(res, {
      categories: categories.filter(Boolean).sort(),
      sources: sources.filter(Boolean).sort(),
      types,
      statuses
    }, 'Filter options retrieved successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

// Export transactions to CSV
export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type, category, status } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (req.user) {
      filter.createdBy = req.user._id;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const transactions = await WalletTransaction.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1 });

    // Convert to CSV format
    const csvData = transactions.map(transaction => ({
      Date: transaction.date.toISOString().split('T')[0],
      Type: transaction.type,
      Category: transaction.category,
      Source: transaction.source,
      Amount: transaction.amount,
      Description: transaction.description || '',
      Status: transaction.status,
      'Created By': transaction.createdBy ? 
        `${(transaction.createdBy as any).firstName} ${(transaction.createdBy as any).lastName}` : '',
      'Created At': transaction.createdAt.toISOString()
    }));

    successResponse(res, { transactions: csvData }, 'Transactions exported successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};

// Add these new methods to walletController.ts

// Get daily statistics for a specific week
export const getDailyStatistics = async (req: Request, res: Response) => {
  try {
    const { year, month, week } = req.query;
    const userId = req.user?._id;

    // Build filter object
    const filter: any = { createdBy: userId };
    
    let startDate: Date;
    let endDate: Date;

    if (year && month && week) {
      // Get specific week
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      const weekNum = parseInt(week as string);
      
      // Calculate start and end of the week
      const firstDayOfMonth = new Date(yearNum, monthNum - 1, 1);
      const firstDayOfWeek = new Date(firstDayOfMonth);
      firstDayOfWeek.setDate(firstDayOfMonth.getDate() + (weekNum - 1) * 7);
      
      startDate = new Date(firstDayOfWeek);
      endDate = new Date(firstDayOfWeek);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to current week
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      firstDayOfWeek.setDate(diff);
      
      startDate = new Date(firstDayOfWeek);
      endDate = new Date(firstDayOfWeek);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Get daily statistics
    const dailyStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format data for chart
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayData = {
        date: currentDate,
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: dateStr,
        income: 0,
        expense: 0,
        balance: 0
      };

      // Find matching data
      const incomeData = dailyStats.find(
        (stat: any) => stat._id.date === dateStr && stat._id.type === 'INCOME'
      );
      const expenseData = dailyStats.find(
        (stat: any) => stat._id.date === dateStr && stat._id.type === 'EXPENSE'
      );

      if (incomeData) dayData.income = incomeData.amount;
      if (expenseData) dayData.expense = expenseData.amount;
      dayData.balance = dayData.income - dayData.expense;

      days.push(dayData);
    }

    // Calculate week summary
    const weekSummary = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summary = weekSummary[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0
    };

    successResponse(res, {
      days,
      summary: {
        ...summary,
        balance: summary.totalIncome - summary.totalExpense
      },
      period: {
        startDate,
        endDate,
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        week: Math.ceil((startDate.getDate() + new Date(startDate.getFullYear(), startDate.getMonth(), 1).getDay()) / 7)
      }
    }, 'Daily statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching daily statistics:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get weekly statistics for a specific month
export const getWeeklyStatistics = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    const userId = req.user?._id;

    // Build filter object
    const filter: any = { createdBy: userId };
    
    let startDate: Date;
    let endDate: Date;

    if (year && month) {
      // Get specific month
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to current month
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Get all transactions for the month
    const monthTransactions = await WalletTransaction.find(filter);

    // Divide into weeks (maximum 5 weeks)
    const weeks = [];
    const currentDate = new Date(startDate);
    
    let weekNumber = 1;
    while (currentDate <= endDate && weekNumber <= 5) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

      // Filter transactions for this week
      const weekTransactions = monthTransactions.filter(transaction => {
        const transDate = new Date(transaction.date);
        return transDate >= weekStart && transDate <= weekEnd;
      });

      // Calculate week totals
      const weekSummary = weekTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === 'INCOME') {
            acc.income += transaction.amount;
          } else {
            acc.expense += transaction.amount;
          }
          acc.transactions += 1;
          return acc;
        },
        { income: 0, expense: 0, transactions: 0 }
      );

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        label: `Week ${weekNumber}`,
        income: weekSummary.income,
        expense: weekSummary.expense,
        balance: weekSummary.income - weekSummary.expense,
        transactions: weekSummary.transactions
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }

    // Calculate month summary
    const monthSummary = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summary = monthSummary[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0
    };

    successResponse(res, {
      weeks,
      summary: {
        ...summary,
        balance: summary.totalIncome - summary.totalExpense
      },
      period: {
        startDate,
        endDate,
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1
      }
    }, 'Weekly statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching weekly statistics:', error);
    errorResponse(res, error.message, 500);
  }
};

// Get monthly statistics for a specific year
export const getMonthlyStatistics = async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const userId = req.user?._id;

    // Build filter object
    const filter: any = { createdBy: userId };
    
    let startDate: Date;
    let endDate: Date;

    if (year) {
      // Get specific year
      const yearNum = parseInt(year as string);
      
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum, 11, 31);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to current year
      const today = new Date();
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Get monthly statistics
    const monthlyStats = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data for all 12 months
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthData = monthlyStats.find(
        (stat: any) => stat._id.month === i + 1
      );

      const monthDate = new Date(startDate.getFullYear(), i, 1);
      
      months.push({
        month: i + 1,
        monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        year: monthDate.getFullYear(),
        income: monthData?.income || 0,
        expense: monthData?.expense || 0,
        balance: (monthData?.income || 0) - (monthData?.expense || 0),
        transactions: monthData?.transactions || 0
      });
    }

    // Calculate year summary
    const yearSummary = await WalletTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summary = yearSummary[0] || {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0
    };

    successResponse(res, {
      months,
      summary: {
        ...summary,
        balance: summary.totalIncome - summary.totalExpense
      },
      period: {
        startDate,
        endDate,
        year: startDate.getFullYear()
      }
    }, 'Monthly statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching monthly statistics:', error);
    errorResponse(res, error.message, 500);
  }
};

// Export to PDF
export const exportToPDF = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type, category, status } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (req.user) {
      filter.createdBy = req.user._id;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const transactions = await WalletTransaction.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: -1 });

    // Format data for PDF
    const pdfData = transactions.map(transaction => ({
      Date: new Date(transaction.date).toLocaleDateString(),
      Type: transaction.type,
      Category: transaction.category,
      Source: transaction.source,
      Amount: `$${transaction.amount.toFixed(2)}`,
      Description: transaction.description || '',
      Status: transaction.status,
      'Created By': transaction.createdBy ? 
        `${(transaction.createdBy as any).firstName} ${(transaction.createdBy as any).lastName}` : '',
      'Created At': new Date(transaction.createdAt).toLocaleDateString()
    }));

    successResponse(res, { transactions: pdfData }, 'PDF data prepared successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
};