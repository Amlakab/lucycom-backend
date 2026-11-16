"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// ==================== PUBLIC ROUTES ====================
router.get('/public/ratings/food/:foodId', orderController_1.getFoodRatings);
router.get('/public/ratings/all', orderController_1.getAllOrders); // Get all ratings summary
router.get('/statuses', orderController_1.getOrderStatuses);
router.get('/:id/rating', orderController_1.getOrderRating); // Public rating view
// ==================== CUSTOMER ROUTES ====================
router.post('/', auth_1.authenticate, orderController_1.createOrder);
router.get('/my-orders', auth_1.authenticate, orderController_1.getCustomerOrders);
router.get('/my-orders/:id', auth_1.authenticate, orderController_1.getCustomerOrder);
router.patch('/my-orders/:id/cancel', auth_1.authenticate, orderController_1.cancelOrder);
router.patch('/my-orders/:id/rate', auth_1.authenticate, orderController_1.rateOrder); // Add rating route
// ==================== MANAGER/ADMIN ROUTES ====================
router.get('/admin/all', auth_1.authenticate, orderController_1.getAllOrders);
router.get('/admin/:id', auth_1.authenticate, orderController_1.getOrderById);
router.patch('/admin/:id/confirm', auth_1.authenticate, orderController_1.confirmOrder);
router.patch('/admin/:id/reject', auth_1.authenticate, orderController_1.rejectOrder);
router.patch('/admin/:id/assign-chef', auth_1.authenticate, orderController_1.assignChef);
router.patch('/admin/:id/assign-waiter', auth_1.authenticate, orderController_1.assignWaiter);
router.get('/admin/stats', auth_1.authenticate, orderController_1.getOrderStatistics);
router.patch('/admin/:id/status', auth_1.authenticate, orderController_1.updateOrderStatus);
// ==================== CHEF ROUTES ====================
router.get('/chef/orders', auth_1.authenticate, orderController_1.getChefOrders);
router.patch('/chef/:id/take', auth_1.authenticate, orderController_1.takeOrder);
router.patch('/chef/:id/ready', auth_1.authenticate, orderController_1.markOrderReady);
// ==================== WAITER ROUTES ====================
router.get('/waiter/orders', auth_1.authenticate, orderController_1.getWaiterOrders);
router.patch('/waiter/:id/take', auth_1.authenticate, orderController_1.takeDelivery);
router.patch('/waiter/:id/deliver', auth_1.authenticate, orderController_1.markDelivered);
exports.default = router;
