"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFeatured = exports.deleteProject = exports.updateProject = exports.createProject = exports.getAllProjects = exports.getPublicProject = exports.getPublicProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const response_1 = require("../utils/response");
// ========== PUBLIC ==========
const getPublicProjects = async (req, res) => {
    try {
        const { featured, category, limit = 12, page = 1 } = req.query;
        const filter = {};
        if (featured === 'true')
            filter.featured = true;
        if (category)
            filter.category = category;
        const result = await (0, response_1.paginate)(Project_1.default, filter, {
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
exports.getPublicProjects = getPublicProjects;
const getPublicProject = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project)
            return (0, response_1.errorResponse)(res, 'Project not found', 404);
        (0, response_1.successResponse)(res, project);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicProject = getPublicProject;
// ========== ADMIN ==========
const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, featured } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category)
            filter.category = category;
        if (featured !== undefined)
            filter.featured = featured === 'true';
        const result = await (0, response_1.paginate)(Project_1.default, filter, {
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
exports.getAllProjects = getAllProjects;
const createProject = async (req, res) => {
    try {
        const { title, description, tags, github, liveUrl, category, featured, order } = req.body;
        let image = '';
        let imageData = undefined;
        if (req.file) {
            imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            image = `/uploads/projects/${Date.now()}-${req.file.originalname}`;
        }
        const project = new Project_1.default({
            title,
            description,
            image,
            imageData,
            tags: tags ? JSON.parse(tags) : [],
            github,
            liveUrl,
            category,
            featured: featured === 'true',
            order: Number(order) || 0,
        });
        await project.save();
        (0, response_1.successResponse)(res, project, 'Project created successfully', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project)
            return (0, response_1.errorResponse)(res, 'Project not found', 404);
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            updateData.image = `/uploads/projects/${Date.now()}-${req.file.originalname}`;
        }
        if (updateData.tags)
            updateData.tags = JSON.parse(updateData.tags);
        if (updateData.featured)
            updateData.featured = updateData.featured === 'true';
        if (updateData.order)
            updateData.order = Number(updateData.order);
        const updated = await Project_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        (0, response_1.successResponse)(res, updated, 'Project updated successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndDelete(req.params.id);
        if (!project)
            return (0, response_1.errorResponse)(res, 'Project not found', 404);
        (0, response_1.successResponse)(res, null, 'Project deleted successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteProject = deleteProject;
const toggleFeatured = async (req, res) => {
    try {
        const project = await Project_1.default.findById(req.params.id);
        if (!project)
            return (0, response_1.errorResponse)(res, 'Project not found', 404);
        project.featured = !project.featured;
        await project.save();
        (0, response_1.successResponse)(res, project, `Featured ${project.featured ? 'enabled' : 'disabled'}`);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.toggleFeatured = toggleFeatured;
