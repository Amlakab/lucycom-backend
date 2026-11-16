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
exports.OrderStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERING"] = "DELIVERING";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["RATED"] = "RATED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(1000 + Math.random() * 9000);
            return `ORD-${year}${month}${day}-${random}`;
        }
    },
    customer: {
        userId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Customer email is required'],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true
        },
        deliveryAddress: {
            type: String,
            required: [true, 'Delivery address is required'],
            trim: true
        }
    },
    items: [{
            foodId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Food',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            total: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    ratingComment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: 500
    },
    assignedChef: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedWaiter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    confirmedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    deliveringAt: Date,
    deliveredAt: Date,
    ratedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.userId': 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ created_at: -1 });
orderSchema.index({ assignedChef: 1 });
orderSchema.index({ assignedWaiter: 1 });
// Virtual for getting status label
orderSchema.virtual('statusLabel').get(function () {
    const labels = {
        [OrderStatus.PENDING]: 'Pending',
        [OrderStatus.CONFIRMED]: 'Confirmed',
        [OrderStatus.PREPARING]: 'Preparing',
        [OrderStatus.READY]: 'Ready for Delivery',
        [OrderStatus.DELIVERING]: 'Delivering',
        [OrderStatus.DELIVERED]: 'Delivered',
        [OrderStatus.RATED]: 'Rated',
        [OrderStatus.COMPLETED]: 'Completed',
        [OrderStatus.CANCELLED]: 'Cancelled'
    };
    return labels[this.status] || this.status;
});
// Virtual for getting status step (for progress tracking)
orderSchema.virtual('statusStep').get(function () {
    const steps = {
        [OrderStatus.PENDING]: 0,
        [OrderStatus.CONFIRMED]: 1,
        [OrderStatus.PREPARING]: 2,
        [OrderStatus.READY]: 3,
        [OrderStatus.DELIVERING]: 4,
        [OrderStatus.DELIVERED]: 5,
        [OrderStatus.RATED]: 6,
        [OrderStatus.COMPLETED]: 7,
        [OrderStatus.CANCELLED]: -1
    };
    return steps[this.status] ?? 0;
});
// Virtual for checking if order is active
orderSchema.virtual('isActive').get(function () {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERING].includes(this.status);
});
// Method to update status with timestamp
orderSchema.method('updateStatus', async function (status, userId, reason) {
    this.status = status;
    switch (status) {
        case OrderStatus.CONFIRMED:
            this.confirmedAt = new Date();
            if (userId)
                this.confirmedBy = userId;
            break;
        case OrderStatus.PREPARING:
            this.preparingAt = new Date();
            break;
        case OrderStatus.READY:
            this.readyAt = new Date();
            break;
        case OrderStatus.DELIVERING:
            this.deliveringAt = new Date();
            break;
        case OrderStatus.DELIVERED:
            this.deliveredAt = new Date();
            break;
        case OrderStatus.RATED:
            this.ratedAt = new Date();
            break;
        case OrderStatus.COMPLETED:
            this.completedAt = new Date();
            break;
        case OrderStatus.CANCELLED:
            this.cancelledAt = new Date();
            if (reason)
                this.cancellationReason = reason;
            break;
    }
    return this.save();
});
// Method to add rating
orderSchema.method('addRating', async function (rating, comment) {
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    this.rating = rating;
    if (comment)
        this.ratingComment = comment;
    this.status = OrderStatus.RATED;
    this.ratedAt = new Date();
    return this.save();
});
// Static method to get order statistics
orderSchema.static('getStatistics', async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' }
            }
        }
    ]);
    const total = await this.countDocuments();
    const pending = await this.countDocuments({ status: OrderStatus.PENDING });
    const confirmed = await this.countDocuments({ status: OrderStatus.CONFIRMED });
    const preparing = await this.countDocuments({ status: OrderStatus.PREPARING });
    const ready = await this.countDocuments({ status: OrderStatus.READY });
    const delivering = await this.countDocuments({ status: OrderStatus.DELIVERING });
    const delivered = await this.countDocuments({ status: OrderStatus.DELIVERED });
    const rated = await this.countDocuments({ status: OrderStatus.RATED });
    const completed = await this.countDocuments({ status: OrderStatus.COMPLETED });
    const cancelled = await this.countDocuments({ status: OrderStatus.CANCELLED });
    // Get average rating
    const ratingStats = await this.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 }
            }
        }
    ]);
    return {
        total,
        pending,
        confirmed,
        preparing,
        ready,
        delivering,
        delivered,
        rated,
        completed,
        cancelled,
        byStatus: stats,
        totalRevenue: stats.reduce((sum, s) => sum + s.totalRevenue, 0),
        avgRating: ratingStats[0]?.avgRating || 0,
        totalRatings: ratingStats[0]?.totalRatings || 0
    };
});
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
