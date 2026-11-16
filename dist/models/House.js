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
exports.ApprovalStatus = exports.HouseStatus = exports.PropertyType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "APARTMENT";
    PropertyType["VILLA"] = "VILLA";
    PropertyType["CONDO"] = "CONDO";
    PropertyType["HOUSE"] = "HOUSE";
    PropertyType["LAND"] = "LAND";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var HouseStatus;
(function (HouseStatus) {
    HouseStatus["AVAILABLE"] = "AVAILABLE";
    HouseStatus["SOLD"] = "SOLD";
    HouseStatus["RENTED"] = "RENTED";
    HouseStatus["UNAVAILABLE"] = "UNAVAILABLE";
    HouseStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
})(HouseStatus || (exports.HouseStatus = HouseStatus = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
const houseSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
houseSchema.statics.incrementView = async function (id) {
    return this.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};
houseSchema.statics.incrementInquiry = async function (id) {
    return this.findByIdAndUpdate(id, { $inc: { inquiries: 1 } }, { new: true });
};
exports.default = mongoose_1.default.model('House', houseSchema);
