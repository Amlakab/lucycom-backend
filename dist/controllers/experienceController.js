"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExperience = exports.updateExperience = exports.createExperience = exports.getAllExperiences = exports.getPublicExperiences = void 0;
const Experience_1 = __importDefault(require("../models/Experience"));
const response_1 = require("../utils/response");
const getPublicExperiences = async (req, res) => {
    try {
        const experiences = await Experience_1.default.find().sort({ order: 1, created_at: -1 });
        (0, response_1.successResponse)(res, experiences);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicExperiences = getPublicExperiences;
const getAllExperiences = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await (0, response_1.paginate)(Experience_1.default, {}, {
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
exports.getAllExperiences = getAllExperiences;
const createExperience = async (req, res) => {
    try {
        const experience = new Experience_1.default(req.body);
        await experience.save();
        (0, response_1.successResponse)(res, experience, 'Experience created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createExperience = createExperience;
const updateExperience = async (req, res) => {
    try {
        const updated = await Experience_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            return (0, response_1.errorResponse)(res, 'Experience not found', 404);
        (0, response_1.successResponse)(res, updated, 'Experience updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateExperience = updateExperience;
const deleteExperience = async (req, res) => {
    try {
        const deleted = await Experience_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return (0, response_1.errorResponse)(res, 'Experience not found', 404);
        (0, response_1.successResponse)(res, null, 'Experience deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteExperience = deleteExperience;
