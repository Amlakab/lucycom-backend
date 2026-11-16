"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const blogController_1 = require("../controllers/blogController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
    const projectRoot = process.cwd();
    const uploadPath = path_1.default.join(projectRoot, 'public', 'uploads', 'blogs');
    if (!fs_1.default.existsSync(uploadPath)) {
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
};
// Initialize upload directory
const uploadPath = createUploadsDirectory();
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});
// Public routes (No authentication required)
router.get('/public/approved', blogController_1.getApprovedBlogs); // NEW: Get only approved blogs
router.get('/public', blogController_1.getPublicBlogs);
router.get('/public/filter-options', blogController_1.getPublicFilterOptions);
router.get('/public/:id', blogController_1.getPublicBlog);
router.get('/:id/view', blogController_1.incrementViews); // Public view increment
// Protected routes (require authentication)
router.get('/', auth_1.authenticate, blogController_1.getAllBlogs);
router.get('/filter-options', auth_1.authenticate, blogController_1.getFilterOptions);
router.get('/stats', auth_1.authenticate, blogController_1.getBlogStatistics);
router.get('/approval-queue', auth_1.authenticate, blogController_1.getApprovalQueue);
router.get('/:id/related', auth_1.authenticate, blogController_1.getRelatedBlogs);
router.get('/:id', auth_1.authenticate, blogController_1.getBlog);
router.post('/', auth_1.authenticate, upload.single('image'), blogController_1.createBlog);
router.put('/:id', auth_1.authenticate, upload.single('image'), blogController_1.updateBlog);
router.patch('/:id/status', auth_1.authenticate, blogController_1.updateBlogStatus);
router.patch('/:id/featured', auth_1.authenticate, blogController_1.toggleFeatured);
router.patch('/:id/approve', auth_1.authenticate, blogController_1.approveBlog);
router.delete('/:id', auth_1.authenticate, blogController_1.deleteBlog);
exports.default = router;
