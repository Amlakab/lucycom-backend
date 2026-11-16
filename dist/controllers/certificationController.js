"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFeaturedd = exports.deleteCertification = exports.updateCertification = exports.createCertification = exports.getAllCertifications = exports.getPublicCertification = exports.getPublicCertifications = void 0;
const Certification_1 = __importDefault(require("../models/Certification"));
const response_1 = require("../utils/response");
// ========== PUBLIC ==========
const getPublicCertifications = async (req, res) => {
    try {
        const certifications = await Certification_1.default.find()
            .sort({ category: 1, startDate: -1 })
            .lean();
        // Group by category
        const groupedCertifications = certifications.reduce((acc, cert) => {
            if (!acc[cert.category]) {
                acc[cert.category] = [];
            }
            acc[cert.category].push(cert);
            return acc;
        }, {});
        (0, response_1.successResponse)(res, groupedCertifications);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicCertifications = getPublicCertifications;
const getPublicCertification = async (req, res) => {
    try {
        const certification = await Certification_1.default.findById(req.params.id);
        if (!certification) {
            return (0, response_1.errorResponse)(res, 'Certification not found', 404);
        }
        (0, response_1.successResponse)(res, certification);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicCertification = getPublicCertification;
// ========== ADMIN ==========
const getAllCertifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { organization: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            filter.category = category;
        }
        const result = await (0, response_1.paginate)(Certification_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { category: 1, startDate: -1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getAllCertifications = getAllCertifications;
const createCertification = async (req, res) => {
    try {
        const { title, organization, description, startDate, endDate, category, credentialId, credentialUrl, featured } = req.body;
        let image = '';
        let imageData = undefined;
        if (req.file) {
            imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            image = `/uploads/certifications/${Date.now()}-${req.file.originalname}`;
        }
        const certification = new Certification_1.default({
            title,
            organization,
            description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            image,
            imageData,
            category,
            credentialId,
            credentialUrl,
            featured: featured === 'true' || featured === true,
        });
        await certification.save();
        (0, response_1.successResponse)(res, certification, 'Certification created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createCertification = createCertification;
const updateCertification = async (req, res) => {
    try {
        const certification = await Certification_1.default.findById(req.params.id);
        if (!certification) {
            return (0, response_1.errorResponse)(res, 'Certification not found', 404);
        }
        const updateData = { ...req.body };
        // Handle image upload
        if (req.file) {
            updateData.imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            updateData.image = `/uploads/certifications/${Date.now()}-${req.file.originalname}`;
        }
        // Parse dates
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }
        // Parse featured boolean
        if (updateData.featured !== undefined) {
            updateData.featured = updateData.featured === 'true' || updateData.featured === true;
        }
        const updated = await Certification_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        (0, response_1.successResponse)(res, updated, 'Certification updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateCertification = updateCertification;
const deleteCertification = async (req, res) => {
    try {
        const deleted = await Certification_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return (0, response_1.errorResponse)(res, 'Certification not found', 404);
        }
        (0, response_1.successResponse)(res, null, 'Certification deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteCertification = deleteCertification;
const toggleFeaturedd = async (req, res) => {
    try {
        const certification = await Certification_1.default.findById(req.params.id);
        if (!certification) {
            return (0, response_1.errorResponse)(res, 'Certification not found', 404);
        }
        certification.featured = !certification.featured;
        await certification.save();
        (0, response_1.successResponse)(res, certification, `Featured ${certification.featured ? 'enabled' : 'disabled'}`);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.toggleFeaturedd = toggleFeaturedd;
