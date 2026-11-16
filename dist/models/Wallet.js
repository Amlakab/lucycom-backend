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
const walletTransactionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
walletTransactionSchema.virtual('formattedDate').get(function () {
    return this.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
});
// Ensure virtuals are included in JSON output
walletTransactionSchema.set('toJSON', { virtuals: true });
walletTransactionSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('WalletTransaction', walletTransactionSchema);
