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
exports.debugHouseImage = exports.getAdminHouseImage = exports.incrementView = exports.getFilterOptions = exports.getHouseStatistics = exports.updateHouseStatus = exports.approveHouse = exports.deleteHouse = exports.updateHouse = exports.createHouse = exports.getHouse = exports.getAllHouses = void 0;
const House_1 = __importStar(require("../models/House"));
const mongoose_1 = __importDefault(require("mongoose"));
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({ success: true, message, data });
};
const errorResponse = (res, message = 'Error', statusCode = 500) => {
    res.status(statusCode).json({ success: false, message });
};
const getAllHouses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        const propertyType = req.query.propertyType || '';
        const status = req.query.status || '';
        const approvalStatus = req.query.approvalStatus || '';
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
        const minBedrooms = parseInt(req.query.minBedrooms) || 0;
        const minBathrooms = parseInt(req.query.minBathrooms) || 0;
        const amenities = req.query.amenities ? req.query.amenities.split(',') : [];
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const filter = {};
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
        if (status)
            filter.status = status;
        if (approvalStatus)
            filter.approvalStatus = approvalStatus;
        if (minBedrooms > 0)
            filter['details.bedrooms'] = { $gte: minBedrooms };
        if (minBathrooms > 0)
            filter['details.bathrooms'] = { $gte: minBathrooms };
        if (amenities.length > 0)
            filter['details.amenities'] = { $all: amenities };
        if (minPrice !== null || maxPrice !== null) {
            filter['pricing.price'] = {};
            if (minPrice !== null)
                filter['pricing.price'].$gte = minPrice;
            if (maxPrice !== null)
                filter['pricing.price'].$lte = maxPrice;
        }
        const sort = {};
        if (sortBy === 'price') {
            sort['pricing.price'] = sortOrder;
        }
        else if (sortBy === '-pricing.price') {
            sort['pricing.price'] = -1;
        }
        else if (sortBy === 'views') {
            sort.views = sortOrder;
        }
        else {
            sort[sortBy] = sortOrder;
        }
        const houses = await House_1.default.find(filter)
            .select('-images.data -threeDModels.data')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('agentId', 'name email profile.phone');
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
        }, 'Houses retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching houses:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getAllHouses = getAllHouses;
const getHouse = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findById(id).populate('agentId', 'name email profile.phone');
        if (!house) {
            return errorResponse(res, 'House not found', 404);
        }
        // Convert to object
        const houseObj = house.toObject();
        // Create response object with image URLs (like approve page)
        const responseData = {
            _id: houseObj._id,
            title: houseObj.title,
            description: houseObj.description,
            propertyType: houseObj.propertyType,
            status: houseObj.status,
            approvalStatus: houseObj.approvalStatus,
            location: houseObj.location,
            details: houseObj.details,
            pricing: houseObj.pricing,
            virtualTour: houseObj.virtualTour,
            agentId: houseObj.agentId,
            agentName: houseObj.agentName,
            agentContact: houseObj.agentContact,
            views: houseObj.views,
            inquiries: houseObj.inquiries,
            created_at: houseObj.created_at,
            updated_at: houseObj.updated_at,
            // Add image URLs for each image (like approve page)
            images: [],
            threeDModels: []
        };
        // Add images with URLs for frontend to fetch (like approve page)
        if (houseObj.images && Array.isArray(houseObj.images)) {
            responseData.images = houseObj.images.map((img, index) => ({
                _id: img._id,
                contentType: img.contentType,
                fileName: img.fileName,
                isPrimary: img.isPrimary,
                url: `/api/houses/${id}/image?index=${index}`
            }));
        }
        // Add 3D models with URLs
        if (houseObj.threeDModels && Array.isArray(houseObj.threeDModels)) {
            responseData.threeDModels = houseObj.threeDModels.map((model, index) => ({
                _id: model._id,
                contentType: model.contentType,
                fileName: model.fileName,
                isDefault: model.isDefault,
                url: `/api/houses/${id}/model?index=${index}`
            }));
        }
        successResponse(res, responseData, 'House retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching house:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getHouse = getHouse;
const createHouse = async (req, res) => {
    try {
        const { title, description, propertyType, location, details, pricing, virtualTour, agentName, agentContact, quantity } = req.body;
        console.log('Received house creation request');
        console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
        const images = [];
        const threeDModels = [];
        if (req.files) {
            const files = req.files;
            if (files.images && files.images.length > 0) {
                console.log(`Processing ${files.images.length} images`);
                files.images.forEach((file, index) => {
                    images.push({
                        data: file.buffer,
                        contentType: file.mimetype,
                        fileName: file.originalname,
                        isPrimary: index === 0
                    });
                });
            }
            if (files.threeDModels && files.threeDModels.length > 0) {
                console.log(`Processing ${files.threeDModels.length} 3D models`);
                files.threeDModels.forEach((file, index) => {
                    console.log(`3D Model ${index + 1}: ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
                    threeDModels.push({
                        data: file.buffer,
                        contentType: file.mimetype || 'model/gltf-binary',
                        fileName: file.originalname,
                        isDefault: index === 0
                    });
                });
            }
        }
        // Parse JSON fields safely
        let parsedLocation, parsedDetails, parsedPricing, parsedVirtualTour;
        try {
            parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
            parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
            parsedPricing = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
            parsedVirtualTour = virtualTour ? (typeof virtualTour === 'string' ? JSON.parse(virtualTour) : virtualTour) : { enabled: false };
        }
        catch (parseError) {
            console.error('JSON parse error:', parseError);
            return errorResponse(res, 'Invalid JSON data in request', 400);
        }
        // Add quantity to pricing if provided
        if (quantity) {
            parsedPricing.quantity = parseInt(quantity);
        }
        else if (!parsedPricing.quantity) {
            parsedPricing.quantity = 1;
        }
        const newHouse = new House_1.default({
            title,
            description,
            propertyType,
            location: parsedLocation,
            details: parsedDetails,
            pricing: parsedPricing,
            images,
            threeDModels,
            virtualTour: parsedVirtualTour,
            agentId: req.user.id,
            agentName: agentName || req.user.name,
            agentContact: agentContact || req.user.email,
            views: 0,
            inquiries: 0
        });
        await newHouse.save();
        console.log('House saved successfully');
        // Destructure to exclude images and threeDModels from response
        const { images: savedImages, threeDModels: savedModels, ...savedHouse } = newHouse.toObject();
        successResponse(res, savedHouse, 'House created successfully', 201);
    }
    catch (error) {
        console.error('Error creating house:', error);
        // Check for specific errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, 'File too large. Maximum file size is 50MB', 400);
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return errorResponse(res, messages.join(', '), 400);
        }
        errorResponse(res, error.message || 'Failed to create house', 500);
    }
};
exports.createHouse = createHouse;
const updateHouse = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findById(id);
        if (!house) {
            return errorResponse(res, 'House not found', 404);
        }
        const updateData = { ...req.body };
        if (req.files) {
            const files = req.files;
            if (files.images) {
                const existingImages = house.images || [];
                const newImages = files.images.map((file, index) => ({
                    data: file.buffer,
                    contentType: file.mimetype,
                    fileName: file.originalname,
                    isPrimary: existingImages.length === 0 && index === 0
                }));
                updateData.images = [...existingImages, ...newImages];
            }
            if (files.threeDModels) {
                const existingModels = house.threeDModels || [];
                const newModels = files.threeDModels.map((file, index) => ({
                    data: file.buffer,
                    contentType: file.mimetype,
                    fileName: file.originalname,
                    isDefault: existingModels.length === 0 && index === 0
                }));
                updateData.threeDModels = [...existingModels, ...newModels];
            }
        }
        if (req.body.keepImages) {
            const keepImageIds = JSON.parse(req.body.keepImages);
            const currentImages = updateData.images || house.images;
            updateData.images = currentImages.filter((img) => keepImageIds.includes(img._id?.toString()));
        }
        if (req.body.keepModels) {
            const keepModelIds = JSON.parse(req.body.keepModels);
            const currentModels = updateData.threeDModels || house.threeDModels;
            updateData.threeDModels = currentModels.filter((model) => keepModelIds.includes(model._id?.toString()));
        }
        if (req.body.location)
            updateData.location = JSON.parse(req.body.location);
        if (req.body.details)
            updateData.details = JSON.parse(req.body.details);
        if (req.body.pricing) {
            const parsedPricing = JSON.parse(req.body.pricing);
            if (!parsedPricing.quantity && house.pricing.quantity) {
                parsedPricing.quantity = house.pricing.quantity;
            }
            updateData.pricing = parsedPricing;
        }
        if (req.body.virtualTour)
            updateData.virtualTour = JSON.parse(req.body.virtualTour);
        if (req.body.quantity) {
            if (!updateData.pricing)
                updateData.pricing = { ...house.pricing };
            updateData.pricing.quantity = parseInt(req.body.quantity);
        }
        const updatedHouse = await House_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedHouse) {
            return errorResponse(res, 'House not found', 404);
        }
        // Destructure to exclude images and threeDModels
        const { images: updatedImages, threeDModels: updatedModels, ...updatedWithoutImages } = updatedHouse.toObject();
        successResponse(res, updatedWithoutImages, 'House updated successfully');
    }
    catch (error) {
        console.error('Error updating house:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.updateHouse = updateHouse;
const deleteHouse = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findById(id);
        if (!house) {
            return errorResponse(res, 'House not found', 404);
        }
        await House_1.default.findByIdAndDelete(id);
        successResponse(res, null, 'House deleted successfully');
    }
    catch (error) {
        errorResponse(res, error.message, 500);
    }
};
exports.deleteHouse = deleteHouse;
const approveHouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus, status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const updateData = {};
        if (approvalStatus)
            updateData.approvalStatus = approvalStatus;
        if (status)
            updateData.status = status;
        if (approvalStatus === House_1.ApprovalStatus.APPROVED && !updateData.status) {
            updateData.status = House_1.HouseStatus.AVAILABLE;
        }
        const updatedHouse = await House_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedHouse) {
            return errorResponse(res, 'House not found', 404);
        }
        // Destructure to exclude images and threeDModels
        const { images, threeDModels, ...updatedWithoutImages } = updatedHouse.toObject();
        successResponse(res, updatedWithoutImages, 'House approval status updated successfully');
    }
    catch (error) {
        errorResponse(res, error.message, 500);
    }
};
exports.approveHouse = approveHouse;
const updateHouseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!Object.values(House_1.HouseStatus).includes(status)) {
            return errorResponse(res, 'Invalid status', 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const updatedHouse = await House_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!updatedHouse) {
            return errorResponse(res, 'House not found', 404);
        }
        // Destructure to exclude images and threeDModels
        const { images, threeDModels, ...updatedWithoutImages } = updatedHouse.toObject();
        successResponse(res, updatedWithoutImages, `House status updated to ${status} successfully`);
    }
    catch (error) {
        errorResponse(res, error.message, 500);
    }
};
exports.updateHouseStatus = updateHouseStatus;
const getHouseStatistics = async (req, res) => {
    try {
        const totalHouses = await House_1.default.countDocuments();
        const availableHouses = await House_1.default.countDocuments({ status: House_1.HouseStatus.AVAILABLE, approvalStatus: House_1.ApprovalStatus.APPROVED });
        const soldHouses = await House_1.default.countDocuments({ status: House_1.HouseStatus.SOLD });
        const rentedHouses = await House_1.default.countDocuments({ status: House_1.HouseStatus.RENTED });
        const pendingApproval = await House_1.default.countDocuments({ approvalStatus: House_1.ApprovalStatus.PENDING });
        const totalViewsResult = await House_1.default.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        const totalViews = totalViewsResult[0]?.totalViews || 0;
        const propertyTypeStats = await House_1.default.aggregate([
            { $match: { propertyType: { $ne: null } } },
            {
                $group: {
                    _id: '$propertyType',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.price' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const priceStats = await House_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$pricing.price' },
                    maxPrice: { $max: '$pricing.price' },
                    avgPrice: { $avg: '$pricing.price' }
                }
            }
        ]);
        const topViewedHouses = await House_1.default.find({ approvalStatus: House_1.ApprovalStatus.APPROVED })
            .sort({ views: -1 })
            .limit(5)
            .select('title views pricing.price propertyType location.city');
        successResponse(res, {
            totalHouses,
            availableHouses,
            soldHouses,
            rentedHouses,
            pendingApproval,
            totalViews,
            propertyTypeStats,
            priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
            topViewedHouses
        }, 'Statistics retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getHouseStatistics = getHouseStatistics;
const getFilterOptions = async (req, res) => {
    try {
        const propertyTypes = Object.values(House_1.PropertyType);
        const statuses = Object.values(House_1.HouseStatus);
        const approvalStatuses = Object.values(House_1.ApprovalStatus);
        const amenities = await House_1.default.distinct('details.amenities');
        const features = await House_1.default.distinct('details.features');
        const priceRange = await House_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$pricing.price' },
                    maxPrice: { $max: '$pricing.price' }
                }
            }
        ]);
        const bedroomOptions = await House_1.default.aggregate([
            {
                $group: {
                    _id: '$details.bedrooms',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const bathroomOptions = await House_1.default.aggregate([
            {
                $group: {
                    _id: '$details.bathrooms',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        successResponse(res, {
            propertyTypes,
            statuses,
            approvalStatuses,
            amenities: amenities.filter(Boolean).sort(),
            features: features.filter(Boolean).sort(),
            priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000000 },
            bedroomOptions: bedroomOptions.filter(b => b._id !== null && b._id !== undefined),
            bathroomOptions: bathroomOptions.filter(b => b._id !== null && b._id !== undefined)
        }, 'Filter options retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching filter options:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getFilterOptions = getFilterOptions;
const incrementView = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid house ID', 400);
        }
        const house = await House_1.default.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).select('-images.data -threeDModels.data');
        if (!house) {
            return errorResponse(res, 'House not found', 404);
        }
        successResponse(res, house, 'View count incremented');
    }
    catch (error) {
        errorResponse(res, error.message, 500);
    }
};
exports.incrementView = incrementView;
const getAdminHouseImage = async (req, res) => {
    try {
        const { id } = req.params;
        const imageIndex = parseInt(req.query.index) || 0;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid house ID' });
        }
        const house = await House_1.default.findById(id);
        if (!house || !house.images || house.images.length === 0) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        const image = house.images[imageIndex];
        if (!image || !image.data) {
            return res.status(404).json({ success: false, message: 'Image data not found' });
        }
        // Check if data is already a Buffer
        let imageBuffer;
        if (Buffer.isBuffer(image.data)) {
            imageBuffer = image.data;
        }
        // Check if data is an object with $binary (MongoDB format)
        else if (typeof image.data === 'object' && image.data !== null) {
            const dataObj = image.data;
            if (dataObj.$binary && dataObj.$binary.base64) {
                // Decode base64 string to Buffer
                imageBuffer = Buffer.from(dataObj.$binary.base64, 'base64');
            }
            else if (dataObj.data && Array.isArray(dataObj.data)) {
                // Convert array to Buffer
                imageBuffer = Buffer.from(dataObj.data);
            }
            else {
                return res.status(500).json({ success: false, message: 'Unsupported image format' });
            }
        }
        // Check if data is a base64 string
        else if (typeof image.data === 'string') {
            imageBuffer = Buffer.from(image.data, 'base64');
        }
        else {
            return res.status(500).json({ success: false, message: 'Unsupported image format' });
        }
        res.setHeader('Content-Type', image.contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(imageBuffer);
    }
    catch (error) {
        console.error('Error serving admin house image:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAdminHouseImage = getAdminHouseImage;
const debugHouseImage = async (req, res) => {
    try {
        const { id } = req.params;
        const house = await House_1.default.findById(id);
        if (!house) {
            return res.json({ error: 'House not found' });
        }
        const imageInfo = {
            hasImages: !!house.images,
            imageCount: house.images?.length || 0,
            firstImageType: house.images?.[0] ? typeof house.images[0].data : 'none',
            firstImageKeys: house.images?.[0] ? Object.keys(house.images[0].data || {}) : [],
            contentType: house.images?.[0]?.contentType
        };
        res.json(imageInfo);
    }
    catch (error) {
        res.json({ error: error.message });
    }
};
exports.debugHouseImage = debugHouseImage;
