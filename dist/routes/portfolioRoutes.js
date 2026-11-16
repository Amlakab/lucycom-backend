"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const experienceController_1 = require("../controllers/experienceController");
const educationController_1 = require("../controllers/educationController");
const testimonialController_1 = require("../controllers/testimonialController");
const blogController_1 = require("../controllers/blogController");
const skillController_1 = require("../controllers/skillController");
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const certificationController_1 = require("../controllers/certificationController");
const partnerController_1 = require("../controllers/partnerController");
const solutionController_1 = require("../controllers/solutionController");
const chatbotController_1 = require("../controllers/chatbotController");
const seed_1 = require("../scripts/seed");
const router = express_1.default.Router();
router.get('/projects', projectController_1.getPublicProjects);
router.get('/projects/:id', projectController_1.getPublicProject);
router.get('/solutions', solutionController_1.getPublicSolutions);
router.get('/solutions/:id', solutionController_1.getPublicSolution);
router.get('/partners', partnerController_1.getPublicPartners);
router.get('/partners/:id', partnerController_1.getPublicPartner);
router.get('/experiences', experienceController_1.getPublicExperiences);
router.get('/educations', educationController_1.getPublicEducations);
router.get('/testimonials', testimonialController_1.getPublicTestimonials);
router.get('/blog', blogController_1.getPublicBlogPosts);
router.get('/blog/:slug', blogController_1.getPublicBlogPost);
router.get('/skills', skillController_1.getPublicSkills);
router.get('/settings', siteSettingsController_1.getPublicSettings);
router.get('/certifications', certificationController_1.getPublicCertifications);
router.get('/certifications/:id', certificationController_1.getPublicCertification);
// Chatbot query endpoint
router.post('/chatbot', chatbotController_1.handleChatbotQuery);
// Safe Seed endpoint
router.post('/seed', async (req, res) => {
    try {
        await (0, seed_1.seedDatabase)();
        res.json({ success: true, message: 'Database seeded with LUCYCOM corporate data successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
