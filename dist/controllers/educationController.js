"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEducation = exports.updateEducation = exports.createEducation = exports.getAllEducations = exports.getPublicEducations = void 0;
const Education_1 = __importDefault(require("../models/Education"));
const response_1 = require("../utils/response");
const getPublicEducations = async (req, res) => {
    try {
        const educations = await Education_1.default.find().sort({ order: 1, created_at: -1 });
        (0, response_1.successResponse)(res, educations);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicEducations = getPublicEducations;
const getAllEducations = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await (0, response_1.paginate)(Education_1.default, {}, {
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
exports.getAllEducations = getAllEducations;
const createEducation = async (req, res) => {
    try {
        const education = new Education_1.default(req.body);
        await education.save();
        (0, response_1.successResponse)(res, education, 'Education created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createEducation = createEducation;
const updateEducation = async (req, res) => {
    try {
        const updated = await Education_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            return (0, response_1.errorResponse)(res, 'Education not found', 404);
        (0, response_1.successResponse)(res, updated, 'Education updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateEducation = updateEducation;
const deleteEducation = async (req, res) => {
    try {
        const deleted = await Education_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return (0, response_1.errorResponse)(res, 'Education not found', 404);
        (0, response_1.successResponse)(res, null, 'Education deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteEducation = deleteEducation;
