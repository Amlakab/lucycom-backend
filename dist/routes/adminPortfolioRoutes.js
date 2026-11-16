"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const projectController_1 = require("../controllers/projectController");
const solutionController_1 = require("../controllers/solutionController");
const partnerController_1 = require("../controllers/partnerController");
const experienceController_1 = require("../controllers/experienceController");
const educationController_1 = require("../controllers/educationController");
const testimonialController_1 = require("../controllers/testimonialController");
const blogController_1 = require("../controllers/blogController");
const skillController_1 = require("../controllers/skillController");
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const certificationController_1 = require("../controllers/certificationController");
const router = express_1.default.Router();
// Multer configuration
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(file.mimetype) && allowed.test(file.originalname.toLowerCase())) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
router.use(auth_1.authenticate);
// Solutions
router.get('/solutions', solutionController_1.getAllSolutions);
router.post('/solutions', upload.single('image'), solutionController_1.createSolution);
router.put('/solutions/:id', upload.single('image'), solutionController_1.updateSolution);
router.delete('/solutions/:id', solutionController_1.deleteSolution);
router.patch('/solutions/:id/featured', solutionController_1.toggleSolutionFeatured);
// Partners
router.get('/partners', partnerController_1.getAllPartners);
router.post('/partners', upload.single('logo'), partnerController_1.createPartner);
router.put('/partners/:id', upload.single('logo'), partnerController_1.updatePartner);
router.delete('/partners/:id', partnerController_1.deletePartner);
router.patch('/partners/:id/featured', partnerController_1.togglePartnerFeatured);
// Projects
router.get('/projects', projectController_1.getAllProjects);
router.post('/projects', upload.single('image'), projectController_1.createProject);
router.put('/projects/:id', upload.single('image'), projectController_1.updateProject);
router.delete('/projects/:id', projectController_1.deleteProject);
router.patch('/projects/:id/featured', projectController_1.toggleFeatured);
// Experiences
router.get('/experiences', experienceController_1.getAllExperiences);
router.post('/experiences', experienceController_1.createExperience);
router.put('/experiences/:id', experienceController_1.updateExperience);
router.delete('/experiences/:id', experienceController_1.deleteExperience);
// Educations
router.get('/educations', educationController_1.getAllEducations);
router.post('/educations', educationController_1.createEducation);
router.put('/educations/:id', educationController_1.updateEducation);
router.delete('/educations/:id', educationController_1.deleteEducation);
// Testimonials
router.get('/testimonials', testimonialController_1.getAllTestimonials);
router.post('/testimonials', upload.single('avatar'), testimonialController_1.createTestimonial);
router.put('/testimonials/:id', upload.single('avatar'), testimonialController_1.updateTestimonial);
router.delete('/testimonials/:id', testimonialController_1.deleteTestimonial);
router.patch('/testimonials/:id/featured', testimonialController_1.toggleTestimonialFeatured);
// Blog
router.get('/blog', blogController_1.getAllBlogPosts);
router.post('/blog', upload.single('image'), blogController_1.createBlogPost);
router.put('/blog/:id', upload.single('image'), blogController_1.updateBlogPost);
router.delete('/blog/:id', blogController_1.deleteBlogPost);
router.patch('/blog/:id/publish', blogController_1.togglePublish);
// Skills
router.get('/skills', skillController_1.getAllSkills);
router.post('/skills', skillController_1.createSkill);
router.put('/skills/:id', skillController_1.updateSkill);
router.delete('/skills/:id', skillController_1.deleteSkill);
// Site Settings
router.get('/settings', siteSettingsController_1.getSiteSettings);
router.put('/settings', upload.fields([
    { name: 'aboutImage', maxCount: 1 },
    { name: 'profileImages', maxCount: 5 },
]), siteSettingsController_1.updateSiteSettings);
// Certifications
router.get('/certifications', certificationController_1.getAllCertifications);
router.post('/certifications', upload.single('image'), certificationController_1.createCertification);
router.put('/certifications/:id', upload.single('image'), certificationController_1.updateCertification);
router.delete('/certifications/:id', certificationController_1.deleteCertification);
router.patch('/certifications/:id/featured', certificationController_1.toggleFeaturedd);
exports.default = router;
