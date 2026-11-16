import express from 'express';
import {
  // Customer controllers
  createOrder,
  getCustomerOrders,
  getCustomerOrder,
  cancelOrder,
  rateOrder,
  getOrderRating,
  // Manager controllers
  getAllOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  assignChef,
  assignWaiter,
  // Chef controllers
  getChefOrders,
  takeOrder,
  markOrderReady,
  // Waiter controllers
  getWaiterOrders,
  takeDelivery,
  markDelivered,
  // Admin extra
  getOrderStatistics,
  getOrderStatuses,
  updateOrderStatus,
  // Public controllers
  getFoodRatings,
  getAllFoodRatings
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/public/ratings/food/:foodId', getFoodRatings);
router.get('/public/ratings/all', getAllOrders); // Get all ratings summary
router.get('/statuses', getOrderStatuses);
router.get('/:id/rating', getOrderRating); // Public rating view

// ==================== CUSTOMER ROUTES ====================
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getCustomerOrders);
router.get('/my-orders/:id', authenticate, getCustomerOrder);
router.patch('/my-orders/:id/cancel', authenticate, cancelOrder);
router.patch('/my-orders/:id/rate', authenticate, rateOrder); // Add rating route

// ==================== MANAGER/ADMIN ROUTES ====================
router.get('/admin/all', authenticate, getAllOrders);
router.get('/admin/:id', authenticate, getOrderById);
router.patch('/admin/:id/confirm', authenticate, confirmOrder);
router.patch('/admin/:id/reject', authenticate, rejectOrder);
router.patch('/admin/:id/assign-chef', authenticate, assignChef);
router.patch('/admin/:id/assign-waiter', authenticate, assignWaiter);
router.get('/admin/stats', authenticate, getOrderStatistics);
router.patch('/admin/:id/status', authenticate, updateOrderStatus);

// ==================== CHEF ROUTES ====================
router.get('/chef/orders', authenticate, getChefOrders);
router.patch('/chef/:id/take', authenticate, takeOrder);
router.patch('/chef/:id/ready', authenticate, markOrderReady);

// ==================== WAITER ROUTES ====================
router.get('/waiter/orders', authenticate, getWaiterOrders);
router.patch('/waiter/:id/take', authenticate, takeDelivery);
router.patch('/waiter/:id/deliver', authenticate, markDelivered);

export default router;