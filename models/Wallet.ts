import mongoose, { Document, Schema } from 'mongoose';

export interface IWalletTransaction extends Document {
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  source: string;
  amount: number;
  description?: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
});

// Indexes for better query performance
walletTransactionSchema.index({ date: -1 });
walletTransactionSchema.index({ type: 1 });
walletTransactionSchema.index({ category: 1 });
walletTransactionSchema.index({ status: 1 });
walletTransactionSchema.index({ createdBy: 1 });
walletTransactionSchema.index({ date: 1, type: 1 });

// Virtual for formatted date
walletTransactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Ensure virtuals are included in JSON output
walletTransactionSchema.set('toJSON', { virtuals: true });
walletTransactionSchema.set('toObject', { virtuals: true });

export default mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);