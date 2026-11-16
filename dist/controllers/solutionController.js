"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSolutionFeatured = exports.deleteSolution = exports.updateSolution = exports.createSolution = exports.getAllSolutions = exports.getPublicSolution = exports.getPublicSolutions = void 0;
const Solution_1 = __importDefault(require("../models/Solution"));
const response_1 = require("../utils/response");
// ========== PUBLIC ==========
const getPublicSolutions = async (req, res) => {
    try {
        const { featured, limit = 20, page = 1 } = req.query;
        const filter = {};
        if (featured === 'true')
            filter.featured = true;
        const result = await (0, response_1.paginate)(Solution_1.default, filter, {
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
exports.getPublicSolutions = getPublicSolutions;
const getPublicSolution = async (req, res) => {
    try {
        const solution = await Solution_1.default.findOne({
            $or: [{ _id: req.params.id }, { slug: req.params.id }],
        });
        if (!solution)
            return (0, response_1.errorResponse)(res, 'Solution not found', 404);
        (0, response_1.successResponse)(res, solution);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicSolution = getPublicSolution;
// ========== ADMIN ==========
const getAllSolutions = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, featured } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (featured !== undefined)
            filter.featured = featured === 'true';
        const result = await (0, response_1.paginate)(Solution_1.default, filter, {
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
exports.getAllSolutions = getAllSolutions;
const createSolution = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
        }
        if (typeof data.features === 'string') {
            try {
                data.features = JSON.parse(data.features);
            }
            catch {
                data.features = data.features.split(',').map((s) => s.trim());
            }
        }
        if (typeof data.keyTechnologies === 'string') {
            try {
                data.keyTechnologies = JSON.parse(data.keyTechnologies);
            }
            catch {
                data.keyTechnologies = data.keyTechnologies.split(',').map((s) => s.trim());
            }
        }
        if (typeof data.order === 'string')
            data.order = Number(data.order);
        if (typeof data.featured === 'string')
            data.featured = data.featured === 'true';
        if (!data.slug && data.title) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        const solution = await Solution_1.default.create(data);
        (0, response_1.successResponse)(res, solution, 'Solution created successfully', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createSolution = createSolution;
const updateSolution = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
        }
        if (typeof data.features === 'string') {
            try {
                data.features = JSON.parse(data.features);
            }
            catch {
                data.features = data.features.split(',').map((s) => s.trim());
            }
        }
        if (typeof data.keyTechnologies === 'string') {
            try {
                data.keyTechnologies = JSON.parse(data.keyTechnologies);
            }
            catch {
                data.keyTechnologies = data.keyTechnologies.split(',').map((s) => s.trim());
            }
        }
        if (typeof data.order === 'string')
            data.order = Number(data.order);
        if (typeof data.featured === 'string')
            data.featured = data.featured === 'true';
        const solution = await Solution_1.default.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        });
        if (!solution)
            return (0, response_1.errorResponse)(res, 'Solution not found', 404);
        (0, response_1.successResponse)(res, solution, 'Solution updated successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateSolution = updateSolution;
const deleteSolution = async (req, res) => {
    try {
        const solution = await Solution_1.default.findByIdAndDelete(req.params.id);
        if (!solution)
            return (0, response_1.errorResponse)(res, 'Solution not found', 404);
        (0, response_1.successResponse)(res, null, 'Solution deleted successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteSolution = deleteSolution;
const toggleSolutionFeatured = async (req, res) => {
    try {
        const solution = await Solution_1.default.findById(req.params.id);
        if (!solution)
            return (0, response_1.errorResponse)(res, 'Solution not found', 404);
        solution.featured = !solution.featured;
        await solution.save();
        (0, response_1.successResponse)(res, solution, 'Featured status updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.toggleSolutionFeatured = toggleSolutionFeatured;
