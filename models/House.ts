import mongoose, { Document, Schema } from 'mongoose';

export enum PropertyType {
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  CONDO = "CONDO",
  HOUSE = "HOUSE",
  LAND = "LAND"
}

export enum HouseStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  RENTED = "RENTED",
  UNAVAILABLE = "UNAVAILABLE",
  PENDING_APPROVAL = "PENDING_APPROVAL"
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface IHouse extends Document {
  title: string;
  description: string;
  propertyType: PropertyType;
  status: HouseStatus;
  approvalStatus: ApprovalStatus;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    lotSize: number;
    yearBuilt: number;
    floors: number;
    parkingSpaces: number;
    furnished: boolean;
    amenities: string[];
    features: string[];
  };
  pricing: {
    price: number;
    pricePerSqft: number;
    maintenanceFee: number;
    taxAmount: number;
    securityDeposit: number;
    quantity: number;
  };
  images: Array<{
    data: Buffer;
    contentType: string;
    fileName: string;
    isPrimary: boolean;
  }>;
  threeDModels: Array<{
    data: Buffer;
    contentType: string;
    fileName: string;
    thumbnail?: string;
    isDefault: boolean;
  }>;
  virtualTour: {
    enabled: boolean;
    url: string;
    embedCode: string;
  };
  agentId: mongoose.Types.ObjectId;
  agentName: string;
  agentContact: string;
  views: number;
  inquiries: number;
  created_at: Date;
  updated_at: Date;
}

const houseSchema = new Schema<IHouse>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  propertyType: {
    type: String,
    enum: Object.values(PropertyType),
    required: [true, 'Property type is required']
  },
  status: {
    type: String,
    enum: Object.values(HouseStatus),
    default: HouseStatus.PENDING_APPROVAL
  },
  approvalStatus: {
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    zipCode: String,
    coordinates: {
      lat: { type: Number, required: true, default: 9.03 },
      lng: { type: Number, required: true, default: 38.74 }
    }
  },
  details: {
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number, required: true, min: 0 },
    lotSize: { type: Number, default: 0 },
    yearBuilt: { type: Number, min: 1800, max: new Date().getFullYear() },
    floors: { type: Number, default: 1, min: 1 },
    parkingSpaces: { type: Number, default: 0 },
    furnished: { type: Boolean, default: false },
    amenities: [String],
    features: [String]
  },
  pricing: {
    price: { type: Number, required: true, min: 0 },
    pricePerSqft: { type: Number, default: 0 },
    maintenanceFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 }
  },
  images: [{
    data: Buffer,
    contentType: String,
    fileName: String,
    isPrimary: { type: Boolean, default: false }
  }],
  threeDModels: [{
    data: Buffer,
    contentType: String,
    fileName: String,
    thumbnail: String,
    isDefault: { type: Boolean, default: false }
  }],
  virtualTour: {
    enabled: { type: Boolean, default: false },
    url: String,
    embedCode: String
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentName: String,
  agentContact: String,
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
houseSchema.index({ 'location.coordinates': '2dsphere' });
houseSchema.index({ propertyType: 1 });
houseSchema.index({ status: 1 });
houseSchema.index({ approvalStatus: 1 });
houseSchema.index({ 'pricing.price': 1 });
houseSchema.index({ created_at: -1 });
houseSchema.index({ title: 'text', description: 'text' });

// Static methods
houseSchema.statics.incrementView = async function(id: string) {
  return this.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};

houseSchema.statics.incrementInquiry = async function(id: string) {
  return this.findByIdAndUpdate(id, { $inc: { inquiries: 1 } }, { new: true });
};

export default mongoose.model<IHouse>('House', houseSchema);