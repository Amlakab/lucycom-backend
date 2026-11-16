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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHouseImage = exports.getThreeDModel = exports.getPublicFilterOptions = exports.getHousesForMap = exports.getPublicHouse = exports.getPublicHouses = void 0;
const House_1 = __importStar(require("../models/House"));
const mongoose_1 = __importDefault(require("mongoose"));
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({ success: true, message, data });
};
const errorResponse = (res, message = 'Error', statusCode = 500) => {
    res.status(statusCode).json({ success: false, message });
};
const getPublicHouses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        const propertyType = req.query.propertyType || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || 10000000;
        const minBedrooms = parseInt(req.query.minBedrooms) || 0;
        const minBathrooms = parseInt(req.query.minBathrooms) || 0;
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const amenities = req.query.amenities ? req.query.amenities.split(',') : [];
        const skip = (page - 1) * limit;
        const filter = {
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }
        if (propertyType)
            filter.propertyType = propertyType;
        if (minBedrooms > 0)
            filter['details.bedrooms'] = { $gte: minBedrooms };
        if (minBathrooms > 0)
            filter['details.bathrooms'] = { $gte: minBathrooms };
        if (amenities.length > 0)
            filter['details.amenities'] = { $all: amenities };
        filter['pricing.price'] = { $gte: minPrice, $lte: maxPrice };
        const sort = {};
        if (sortBy === 'price') {
            sort['pricing.price'] = sortOrder;
        }
        else {
            sort[sortBy] = sortOrder;
        }
        // Get houses WITHOUT image data for performance
        const houses = await House_1.default.find(filter)
            .select('-images.data -threeDModels.data')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const totalHouses = await House_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalHouses / limit);
        successResponse(res, {
            houses,
            pagination: {
                currentPage: page,
                totalPages,
                totalHouses,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }, 'Public houses retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching public houses:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getPublicHouses = getPublicHouses;
const getPublicHouse = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findOne({
            _id: id,
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        }).populate('agentId', 'name email profile.phone');
        if (!house) {
            return errorResponse(res, 'House not found or not available', 404);
        }
        const houseWithImages = {
            ...house.toObject(),
            images: house.images.map(img => ({
                contentType: img.contentType,
                fileName: img.fileName,
                isPrimary: img.isPrimary,
                data: img.data ? img.data.toString('base64') : null
            })),
            threeDModels: house.threeDModels.map(model => {
                // Properly convert binary data to base64
                let base64Data = null;
                if (model.data) {
                    if (Buffer.isBuffer(model.data)) {
                        base64Data = model.data.toString('base64');
                    }
                    else if (typeof model.data === 'object' && model.data !== null) {
                        const dataObj = model.data;
                        if (dataObj.$binary && dataObj.$binary.base64) {
                            base64Data = dataObj.$binary.base64;
                        }
                        else if (dataObj.data && Array.isArray(dataObj.data)) {
                            base64Data = Buffer.from(dataObj.data).toString('base64');
                        }
                    }
                }
                return {
                    contentType: model.contentType,
                    fileName: model.fileName,
                    isDefault: model.isDefault,
                    data: base64Data
                };
            })
        };
        successResponse(res, houseWithImages, 'House retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching public house:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getPublicHouse = getPublicHouse;
const getHousesForMap = async (req, res) => {
    try {
        const { bounds } = req.query;
        let filter = {
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        };
        if (bounds) {
            const { ne, sw } = JSON.parse(bounds);
            filter['location.coordinates'] = {
                $geoWithin: {
                    $box: [
                        [sw.lng, sw.lat],
                        [ne.lng, ne.lat]
                    ]
                }
            };
        }
        const houses = await House_1.default.find(filter)
            .select('title propertyType pricing.price location.coordinates location.city location.state details.bedrooms details.bathrooms details.area');
        const housesWithMapData = houses.map(house => ({
            _id: house._id,
            title: house.title,
            propertyType: house.propertyType,
            price: house.pricing.price,
            location: {
                city: house.location.city,
                state: house.location.state,
                coordinates: house.location.coordinates
            },
            details: {
                bedrooms: house.details.bedrooms,
                bathrooms: house.details.bathrooms,
                area: house.details.area
            }
        }));
        successResponse(res, housesWithMapData, 'Map houses retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching map houses:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getHousesForMap = getHousesForMap;
const getPublicFilterOptions = async (req, res) => {
    try {
        const propertyTypes = await House_1.default.distinct('propertyType', {
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        });
        const amenities = await House_1.default.distinct('details.amenities', {
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        });
        const features = await House_1.default.distinct('details.features', {
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        });
        const priceRange = await House_1.default.aggregate([
            { $match: { status: House_1.HouseStatus.AVAILABLE, approvalStatus: House_1.ApprovalStatus.APPROVED } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$pricing.price' },
                    maxPrice: { $max: '$pricing.price' }
                }
            }
        ]);
        const bedroomOptions = await House_1.default.aggregate([
            { $match: { status: House_1.HouseStatus.AVAILABLE, approvalStatus: House_1.ApprovalStatus.APPROVED } },
            { $group: { _id: '$details.bedrooms', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const bathroomOptions = await House_1.default.aggregate([
            { $match: { status: House_1.HouseStatus.AVAILABLE, approvalStatus: House_1.ApprovalStatus.APPROVED } },
            { $group: { _id: '$details.bathrooms', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        successResponse(res, {
            propertyTypes: propertyTypes.filter(Boolean).sort(),
            amenities: amenities.filter(Boolean).sort(),
            features: features.filter(Boolean).sort(),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000000 },
            bedroomOptions: bedroomOptions.filter(b => b._id !== null),
            bathroomOptions: bathroomOptions.filter(b => b._id !== null)
        }, 'Public filter options retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching public filter options:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getPublicFilterOptions = getPublicFilterOptions;
const getThreeDModel = async (req, res) => {
    try {
        const { id } = req.params;
        const modelIndex = parseInt(req.query.index) || 0;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findOne({
            _id: id,
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        });
        if (!house || !house.threeDModels || house.threeDModels.length === 0) {
            return errorResponse(res, '3D model not found', 404);
        }
        const model = house.threeDModels[modelIndex];
        res.set('Content-Type', model.contentType);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(model.data);
    }
    catch (error) {
        console.error('Error serving 3D model:', error);
        errorResponse(res, 'Internal server error', 500);
    }
};
exports.getThreeDModel = getThreeDModel;
const getHouseImage = async (req, res) => {
    try {
        const { id } = req.params;
        const imageIndex = parseInt(req.query.index) || 0;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findOne({
            _id: id,
            status: House_1.HouseStatus.AVAILABLE,
            approvalStatus: House_1.ApprovalStatus.APPROVED
        });
        if (!house || !house.images || house.images.length === 0) {
            return errorResponse(res, 'Image not found', 404);
        }
        const image = house.images[imageIndex];
        res.set('Content-Type', image.contentType);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(image.data);
    }
    catch (error) {
        console.error('Error serving house image:', error);
        errorResponse(res, 'Internal server error', 500);
    }
};
exports.getHouseImage = getHouseImage;
