"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agendaController_1 = require("../controllers/agendaController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
// Public routes (for authenticated users)
router.get('/', agendaController_1.getAllAgendas);
router.get('/stats', agendaController_1.getAgendaStatistics);
router.get('/filter-options', agendaController_1.getFilterOptions);
router.get('/approval-queue', agendaController_1.getApprovalQueue);
router.get('/:id', agendaController_1.getAgenda);
// Protected routes
router.post('/', agendaController_1.createAgenda);
router.put('/:id', agendaController_1.updateAgenda);
router.delete('/:id', agendaController_1.deleteAgenda);
// Approval routes - only for admin/moderator
router.patch('/:id/approve', auth_1.authenticate, agendaController_1.approveAgenda);
router.patch('/:id/continue', agendaController_1.continueAgenda);
// Student lookup route
router.post('/students/by-ids', agendaController_1.getStudentsByIds); // Add this route
router.post('/users/by-ids', agendaController_1.getUsersByIds); // New route for user lookup
exports.default = router;
