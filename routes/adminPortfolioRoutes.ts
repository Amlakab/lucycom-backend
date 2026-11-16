import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleFeatured,
} from '../controllers/projectController';
import {
  getAllSolutions,
  createSolution,
  updateSolution,
  deleteSolution,
  toggleSolutionFeatured,
} from '../controllers/solutionController';
import {
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  togglePartnerFeatured,
} from '../controllers/partnerController';
import {
  getAllExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController';
import {
  getAllEducations,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../controllers/educationController';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialFeatured,
} from '../controllers/testimonialController';
import {
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublish,
} from '../controllers/blogController';
import {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController';
import {
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/siteSettingsController';
import {
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  toggleFeaturedd,
} from '../controllers/certificationController';

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(file.mimetype) && allowed.test(file.originalname.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.use(authenticate);

// Solutions
router.get('/solutions', getAllSolutions);
router.post('/solutions', upload.single('image'), createSolution);
router.put('/solutions/:id', upload.single('image'), updateSolution);
router.delete('/solutions/:id', deleteSolution);
router.patch('/solutions/:id/featured', toggleSolutionFeatured);

// Partners
router.get('/partners', getAllPartners);
router.post('/partners', upload.single('logo'), createPartner);
router.put('/partners/:id', upload.single('logo'), updatePartner);
router.delete('/partners/:id', deletePartner);
router.patch('/partners/:id/featured', togglePartnerFeatured);

// Projects
router.get('/projects', getAllProjects);
router.post('/projects', upload.single('image'), createProject);
router.put('/projects/:id', upload.single('image'), updateProject);
router.delete('/projects/:id', deleteProject);
router.patch('/projects/:id/featured', toggleFeatured);

// Experiences
router.get('/experiences', getAllExperiences);
router.post('/experiences', createExperience);
router.put('/experiences/:id', updateExperience);
router.delete('/experiences/:id', deleteExperience);

// Educations
router.get('/educations', getAllEducations);
router.post('/educations', createEducation);
router.put('/educations/:id', updateEducation);
router.delete('/educations/:id', deleteEducation);

// Testimonials
router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', upload.single('avatar'), createTestimonial);
router.put('/testimonials/:id', upload.single('avatar'), updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.patch('/testimonials/:id/featured', toggleTestimonialFeatured);

// Blog
router.get('/blog', getAllBlogPosts);
router.post('/blog', upload.single('image'), createBlogPost);
router.put('/blog/:id', upload.single('image'), updateBlogPost);
router.delete('/blog/:id', deleteBlogPost);
router.patch('/blog/:id/publish', togglePublish);

// Skills
router.get('/skills', getAllSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Site Settings
router.get('/settings', getSiteSettings);
router.put(
  '/settings',
  upload.fields([
    { name: 'aboutImage', maxCount: 1 },
    { name: 'profileImages', maxCount: 5 },
  ]),
  updateSiteSettings
);

// Certifications
router.get('/certifications', getAllCertifications);
router.post('/certifications', upload.single('image'), createCertification);
router.put('/certifications/:id', upload.single('image'), updateCertification);
router.delete('/certifications/:id', deleteCertification);
router.patch('/certifications/:id/featured', toggleFeaturedd);

export default router;
