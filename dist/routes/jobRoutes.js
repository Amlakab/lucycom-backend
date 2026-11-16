"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const jobController_1 = require("../controllers/jobController");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
// Get job assignments for current user's class
router.get('/', jobController_1.getJobs);
// Get eligible students for job assignment
router.get('/eligible-students', jobController_1.getEligibleStudents);
// Get job statistics
router.get('/stats', jobController_1.getJobStats);
// Assign job to student
router.post('/assign', jobController_1.assignJob);
// Update job (sub_class and background)
router.patch('/:id', jobController_1.updateJob);
// Delete job assignment
router.delete('/:id', jobController_1.deleteJob);
router.get('/student/:studentId/all', jobController_1.getAllJobsByStudentId);
exports.default = router;
