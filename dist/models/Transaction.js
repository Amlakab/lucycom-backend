"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const transactionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
transactionSchema.pre('save', async function (next) {
    if (this.isNew) {
        const prefix = this.type === 'INCOME' ? 'INC' : 'EXP';
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose_1.default.models.Transaction?.countDocuments({
            transactionId: new RegExp(`^${prefix}${year}${month}`)
        }) || 0;
        const sequence = (count + 1).toString().padStart(4, '0');
        this.transactionId = `${prefix}${year}${month}${sequence}`;
    }
    next();
});
// Virtual for transaction type label
transactionSchema.virtual('typeLabel').get(function () {
    return this.type === 'INCOME' ? 'Income' : 'Expense';
});
// Virtual for category label mapping
transactionSchema.virtual('categoryLabel').get(function () {
    const categoryLabels = {
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
exports.default = mongoose_1.default.model('Transaction', transactionSchema);
