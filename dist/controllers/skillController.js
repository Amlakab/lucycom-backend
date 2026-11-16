"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getAllSkills = exports.getPublicSkills = void 0;
const Skill_1 = __importDefault(require("../models/Skill"));
const response_1 = require("../utils/response");
const getPublicSkills = async (req, res) => {
    try {
        const skills = await Skill_1.default.find().sort({ category: 1, order: 1 });
        (0, response_1.successResponse)(res, skills);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicSkills = getPublicSkills;
const getAllSkills = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        const result = await (0, response_1.paginate)(Skill_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { category: 1, order: 1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getAllSkills = getAllSkills;
const createSkill = async (req, res) => {
    try {
        const skill = new Skill_1.default(req.body);
        await skill.save();
        (0, response_1.successResponse)(res, skill, 'Skill created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createSkill = createSkill;
const updateSkill = async (req, res) => {
    try {
        const updated = await Skill_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            return (0, response_1.errorResponse)(res, 'Skill not found', 404);
        (0, response_1.successResponse)(res, updated, 'Skill updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res) => {
    try {
        const deleted = await Skill_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return (0, response_1.errorResponse)(res, 'Skill not found', 404);
        (0, response_1.successResponse)(res, null, 'Skill deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteSkill = deleteSkill;
