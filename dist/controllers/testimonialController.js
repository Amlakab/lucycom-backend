"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTestimonialFeatured = exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.getAllTestimonials = exports.getPublicTestimonials = void 0;
const Testimonial_1 = __importDefault(require("../models/Testimonial"));
const response_1 = require("../utils/response");
const getPublicTestimonials = async (req, res) => {
    try {
        const { featured } = req.query;
        const filter = {};
        if (featured === 'true')
            filter.featured = true;
        const testimonials = await Testimonial_1.default.find(filter)
            .sort({ order: 1, created_at: -1 });
        (0, response_1.successResponse)(res, testimonials);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicTestimonials = getPublicTestimonials;
const getAllTestimonials = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await (0, response_1.paginate)(Testimonial_1.default, {}, {
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
exports.getAllTestimonials = getAllTestimonials;
const createTestimonial = async (req, res) => {
    try {
        const { name, role, content, rating, featured, order } = req.body;
        let avatar = '';
        let avatarData = undefined;
        if (req.file) {
            avatarData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            avatar = `/uploads/testimonials/${Date.now()}-${req.file.originalname}`;
        }
        const testimonial = new Testimonial_1.default({
            name,
            role,
            content,
            avatar,
            avatarData,
            rating: Number(rating),
            featured: featured === 'true',
            order: Number(order) || 0,
        });
        await testimonial.save();
        (0, response_1.successResponse)(res, testimonial, 'Testimonial created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createTestimonial = createTestimonial;
const updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial_1.default.findById(req.params.id);
        if (!testimonial)
            return (0, response_1.errorResponse)(res, 'Testimonial not found', 404);
        const updateData = { ...req.body };
        if (req.file) {
            updateData.avatarData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            updateData.avatar = `/uploads/testimonials/${Date.now()}-${req.file.originalname}`;
        }
        if (updateData.rating)
            updateData.rating = Number(updateData.rating);
        if (updateData.featured)
            updateData.featured = updateData.featured === 'true';
        if (updateData.order)
            updateData.order = Number(updateData.order);
        const updated = await Testimonial_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        (0, response_1.successResponse)(res, updated, 'Testimonial updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateTestimonial = updateTestimonial;
const deleteTestimonial = async (req, res) => {
    try {
        const deleted = await Testimonial_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return (0, response_1.errorResponse)(res, 'Testimonial not found', 404);
        (0, response_1.successResponse)(res, null, 'Testimonial deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteTestimonial = deleteTestimonial;
const toggleTestimonialFeatured = async (req, res) => {
    try {
        const testimonial = await Testimonial_1.default.findById(req.params.id);
        if (!testimonial)
            return (0, response_1.errorResponse)(res, 'Testimonial not found', 404);
        testimonial.featured = !testimonial.featured;
        await testimonial.save();
        (0, response_1.successResponse)(res, testimonial, `Featured ${testimonial.featured ? 'enabled' : 'disabled'}`);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.toggleTestimonialFeatured = toggleTestimonialFeatured;
