import express from 'express';
import { getPublicProjects, getPublicProject } from '../controllers/projectController';
import { getPublicExperiences } from '../controllers/experienceController';
import { getPublicEducations } from '../controllers/educationController';
import { getPublicTestimonials } from '../controllers/testimonialController';
import { getPublicBlogPosts, getPublicBlogPost } from '../controllers/blogController';
import { getPublicSkills } from '../controllers/skillController';
import { getPublicSettings } from '../controllers/siteSettingsController';
import { getPublicCertifications, getPublicCertification } from '../controllers/certificationController';
import { getPublicPartners, getPublicPartner } from '../controllers/partnerController';
import { getPublicSolutions, getPublicSolution } from '../controllers/solutionController';
import { handleChatbotQuery } from '../controllers/chatbotController';
import { seedDatabase } from '../scripts/seed';

const router = express.Router();

router.get('/projects', getPublicProjects);
router.get('/projects/:id', getPublicProject);
router.get('/solutions', getPublicSolutions);
router.get('/solutions/:id', getPublicSolution);
router.get('/partners', getPublicPartners);
router.get('/partners/:id', getPublicPartner);
router.get('/experiences', getPublicExperiences);
router.get('/educations', getPublicEducations);
router.get('/testimonials', getPublicTestimonials);
router.get('/blog', getPublicBlogPosts);
router.get('/blog/:slug', getPublicBlogPost);
router.get('/skills', getPublicSkills);
router.get('/settings', getPublicSettings);
router.get('/certifications', getPublicCertifications);
router.get('/certifications/:id', getPublicCertification);

// Chatbot query endpoint
router.post('/chatbot', handleChatbotQuery);

// Safe Seed endpoint
router.post('/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded with LUCYCOM corporate data successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
