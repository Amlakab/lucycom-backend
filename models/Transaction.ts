import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  source: string;
  amount: number;
  description?: string;
  status: 'CONFIRMED';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
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
    trim: true,
    enum: [
      // Income Categories
      'CAFETERIA_SALES',
      'EVENT_SALES',
      'DONATION',
      'MISCELLANEOUS_INCOME',
      
      // Expense Categories
      'FOOD_SUPPLIES',
      'BEVERAGES',
      'STAFF_SALARY',
      'UTILITIES',
      'MAINTENANCE',
      'EQUIPMENT',
      'RENT',
      'TRANSPORT',
      'MARKETING',
      'MISCELLANEOUS_EXPENSE',
      'OTHER'
    ]
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
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['CONFIRMED'],
    default: 'CONFIRMED',
    immutable: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ type: 1, category: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ source: 1 });
transactionSchema.index({ amount: 1 });

// Pre-save hook to generate transactionId
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const prefix = this.type === 'INCOME' ? 'INC' : 'EXP';
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    const count = await mongoose.models.Transaction?.countDocuments({
      transactionId: new RegExp(`^${prefix}${year}${month}`)
    }) || 0;
    
    const sequence = (count + 1).toString().padStart(4, '0');
    this.transactionId = `${prefix}${year}${month}${sequence}`;
  }
  next();
});

// Virtual for transaction type label
transactionSchema.virtual('typeLabel').get(function() {
  return this.type === 'INCOME' ? 'Income' : 'Expense';
});

// Virtual for category label mapping
transactionSchema.virtual('categoryLabel').get(function() {
  const categoryLabels: Record<string, string> = {
    // Income Categories
    'CAFETERIA_SALES': 'Cafeteria Sales',
    'EVENT_SALES': 'Event Sales',
    'DONATION': 'Donation',
    'MISCELLANEOUS_INCOME': 'Miscellaneous Income',
    
    // Expense Categories
    'FOOD_SUPPLIES': 'Food Supplies',
    'BEVERAGES': 'Beverages',
    'STAFF_SALARY': 'Staff Salary',
    'UTILITIES': 'Utilities',
    'MAINTENANCE': 'Maintenance',
    'EQUIPMENT': 'Equipment',
    'RENT': 'Rent',
    'TRANSPORT': 'Transport',
    'MARKETING': 'Marketing',
    'MISCELLANEOUS_EXPENSE': 'Miscellaneous Expense',
    'OTHER': 'Other'
  };
  
  return categoryLabels[this.category] || this.category;
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);