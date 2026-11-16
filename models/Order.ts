import mongoose, { Document, Schema, Model } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  RATED = 'RATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IOrderItem {
  foodId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IOrderCustomer {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  specialInstructions?: string;
  assignedChef?: mongoose.Types.ObjectId;
  assignedWaiter?: mongoose.Types.ObjectId;
  confirmedBy?: mongoose.Types.ObjectId;
  rating?: number; // Add rating field (1-5)
  ratingComment?: string; // Optional comment
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  deliveringAt?: Date;
  deliveredAt?: Date;
  ratedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  created_at: Date;
  updated_at: Date;
  
  // Instance methods
  updateStatus(status: OrderStatus, userId?: string, reason?: string): Promise<IOrder>;
  addRating(rating: number, comment?: string): Promise<IOrder>;
  
  // Virtuals
  statusLabel: string;
  statusStep: number;
  isActive: boolean;
}

// Extend the Model interface for static methods
interface IOrderModel extends Model<IOrder> {
  getStatistics(): Promise<any>;
}

const orderSchema = new Schema<IOrder, IOrderModel>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
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
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedWaiter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedBy: {
    type: Schema.Types.ObjectId,
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
orderSchema.virtual('statusLabel').get(function(this: IOrder) {
  const labels: Record<OrderStatus, string> = {
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
orderSchema.virtual('statusStep').get(function(this: IOrder) {
  const steps: Record<OrderStatus, number> = {
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
orderSchema.virtual('isActive').get(function(this: IOrder) {
  return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERING].includes(this.status);
});

// Method to update status with timestamp
orderSchema.method('updateStatus', async function(this: IOrder, status: OrderStatus, userId?: string, reason?: string) {
  this.status = status;
  
  switch(status) {
    case OrderStatus.CONFIRMED:
      this.confirmedAt = new Date();
      if (userId) this.confirmedBy = userId as any;
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
      if (reason) this.cancellationReason = reason;
      break;
  }
  
  return this.save();
});

// Method to add rating
orderSchema.method('addRating', async function(this: IOrder, rating: number, comment?: string) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  this.rating = rating;
  if (comment) this.ratingComment = comment;
  this.status = OrderStatus.RATED;
  this.ratedAt = new Date();
  return this.save();
});

// Static method to get order statistics
orderSchema.static('getStatistics', async function() {
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
    totalRevenue: stats.reduce((sum: number, s: any) => sum + s.totalRevenue, 0),
    avgRating: ratingStats[0]?.avgRating || 0,
    totalRatings: ratingStats[0]?.totalRatings || 0
  };
});

const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);
export default Order;