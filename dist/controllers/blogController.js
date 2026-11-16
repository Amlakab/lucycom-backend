"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePublish = exports.deleteBlogPost = exports.updateBlogPost = exports.createBlogPost = exports.getAllBlogPosts = exports.getPublicBlogPost = exports.getPublicBlogPosts = void 0;
const BlogPost_1 = __importDefault(require("../models/BlogPost"));
const response_1 = require("../utils/response");
// ========== PUBLIC ==========
const getPublicBlogPosts = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const filter = { published: true };
        const result = await (0, response_1.paginate)(BlogPost_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { publishedAt: -1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicBlogPosts = getPublicBlogPosts;
const getPublicBlogPost = async (req, res) => {
    try {
        const post = await BlogPost_1.default.findOne({
            slug: req.params.slug,
            published: true,
        });
        if (!post)
            return (0, response_1.errorResponse)(res, 'Blog post not found', 404);
        // Increment views
        post.views += 1;
        await post.save();
        (0, response_1.successResponse)(res, post);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicBlogPost = getPublicBlogPost;
// ========== ADMIN ==========
const getAllBlogPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, published } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
            ];
        }
        if (published !== undefined)
            filter.published = published === 'true';
        const result = await (0, response_1.paginate)(BlogPost_1.default, filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { publishedAt: -1, created_at: -1 },
        });
        (0, response_1.successResponse)(res, result);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getAllBlogPosts = getAllBlogPosts;
const createBlogPost = async (req, res) => {
    try {
        const { title, slug, excerpt, content, category, tags, published } = req.body;
        let image = '';
        let imageData = undefined;
        if (req.file) {
            imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            image = `/uploads/blog/${Date.now()}-${req.file.originalname}`;
        }
        const isPublished = published === 'true';
        const post = new BlogPost_1.default({
            title,
            slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt,
            content,
            image,
            imageData,
            category,
            tags: tags ? JSON.parse(tags) : [],
            published: isPublished,
            publishedAt: isPublished ? new Date() : undefined, // ✅ Now allowed
        });
        await post.save();
        (0, response_1.successResponse)(res, post, 'Blog post created', 201);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.createBlogPost = createBlogPost;
const updateBlogPost = async (req, res) => {
    try {
        const post = await BlogPost_1.default.findById(req.params.id);
        if (!post)
            return (0, response_1.errorResponse)(res, 'Blog post not found', 404);
        const updateData = { ...req.body };
        // Handle image upload
        if (req.file) {
            updateData.imageData = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                fileName: req.file.originalname,
            };
            updateData.image = `/uploads/blog/${Date.now()}-${req.file.originalname}`;
        }
        // Parse tags if sent as string
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = JSON.parse(updateData.tags);
        }
        // Handle publishing status
        if (updateData.published !== undefined) {
            const isPublished = updateData.published === 'true' || updateData.published === true;
            updateData.published = isPublished;
            // If published and was previously unpublished → set publishedAt
            if (isPublished && !post.published) {
                updateData.publishedAt = new Date();
            }
            // If unpublished → remove publishedAt
            if (!isPublished) {
                updateData.publishedAt = undefined; // ✅ Now allowed
            }
        }
        const updated = await BlogPost_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        (0, response_1.successResponse)(res, updated, 'Blog post updated');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.updateBlogPost = updateBlogPost;
const deleteBlogPost = async (req, res) => {
    try {
        const deleted = await BlogPost_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return (0, response_1.errorResponse)(res, 'Blog post not found', 404);
        (0, response_1.successResponse)(res, null, 'Blog post deleted');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.deleteBlogPost = deleteBlogPost;
const togglePublish = async (req, res) => {
    try {
        const post = await BlogPost_1.default.findById(req.params.id);
        if (!post)
            return (0, response_1.errorResponse)(res, 'Blog post not found', 404);
        post.published = !post.published;
        post.publishedAt = post.published ? new Date() : undefined; // ✅ Now allowed
        await post.save();
        (0, response_1.successResponse)(res, post, `Published ${post.published ? 'enabled' : 'disabled'}`);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.togglePublish = togglePublish;
