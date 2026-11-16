"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePartnerFeatured = exports.deletePartner = exports.updatePartner = exports.createPartner = exports.getAllPartners = exports.getPublicPartner = exports.getPublicPartners = void 0;
const Partner_1 = __importDefault(require("../models/Partner"));
const response_1 = require("../utils/response");
// ========== PUBLIC ==========
const getPublicPartners = async (req, res) => {
    try {
        const { featured, limit = 50, page = 1 } = req.query;
        const filter = {};
        if (featured === 'true')
            filter.featured = true;
        const result = await (0, response_1.paginate)(Partner_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { order: 1, created_at: -1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicPartners = getPublicPartners;
const getPublicPartner = async (req, res) => {
    try {
        const partner = await Partner_1.default.findById(req.params.id);
        if (!partner)
            return (0, response_1.errorResponse)(res, 'Partner not found', 404);
        (0, response_1.successResponse)(res, partner);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicPartner = getPublicPartner;
// ========== ADMIN ==========
const getAllPartners = async (req, res) => {
    try {
        const { page = 1, limit = 50, search, featured } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { domain: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (featured !== undefined)
            filter.featured = featured === 'true';
        const result = await (0, response_1.paginate)(Partner_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { order: 1, created_at: -1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getAllPartners = getAllPartners;
const createPartner = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.logoData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
        }
        if (typeof data.order === 'string')
            data.order = Number(data.order);
        if (typeof data.featured === 'string')
            data.featured = data.featured === 'true';
        const partner = await Partner_1.default.create(data);
        (0, response_1.successResponse)(res, partner, 'Partner created successfully', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createPartner = createPartner;
const updatePartner = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.logoData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
        }
        if (typeof data.order === 'string')
            data.order = Number(data.order);
        if (typeof data.featured === 'string')
            data.featured = data.featured === 'true';
        const partner = await Partner_1.default.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        });
        if (!partner)
            return (0, response_1.errorResponse)(res, 'Partner not found', 404);
        (0, response_1.successResponse)(res, partner, 'Partner updated successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updatePartner = updatePartner;
const deletePartner = async (req, res) => {
    try {
        const partner = await Partner_1.default.findByIdAndDelete(req.params.id);
        if (!partner)
            return (0, response_1.errorResponse)(res, 'Partner not found', 404);
        (0, response_1.successResponse)(res, null, 'Partner deleted successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deletePartner = deletePartner;
const togglePartnerFeatured = async (req, res) => {
    try {
        const partner = await Partner_1.default.findById(req.params.id);
        if (!partner)
            return (0, response_1.errorResponse)(res, 'Partner not found', 404);
        partner.featured = !partner.featured;
        await partner.save();
        (0, response_1.successResponse)(res, partner, 'Featured status updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.togglePartnerFeatured = togglePartnerFeatured;
