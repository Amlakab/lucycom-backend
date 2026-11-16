"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFoodRatings = exports.getFoodRatings = exports.getOrderRating = exports.rateOrder = exports.updateOrderStatus = exports.getOrderStatuses = exports.getOrderStatistics = exports.markDelivered = exports.takeDelivery = exports.getWaiterOrders = exports.markOrderReady = exports.takeOrder = exports.getChefOrders = exports.assignWaiter = exports.assignChef = exports.rejectOrder = exports.confirmOrder = exports.getOrderById = exports.getAllOrders = exports.cancelOrder = exports.getCustomerOrder = exports.getCustomerOrders = exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importStar(require("../models/Order"));
const Food_1 = __importDefault(require("../models/Food"));
const User_1 = __importDefault(require("../models/User"));
// Helper functions
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
const errorResponse = (res, message = 'Error', statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        message
    });
};
// ==================== CUSTOMER CONTROLLERS ====================
// Create new order (Customer)
const createOrder = async (req, res) => {
    try {
        const { items, specialInstructions, deliveryAddress, phone, email, name } = req.body;
        const userId = req.user?._id;
        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return errorResponse(res, 'At least one item is required', 400);
        }
        // Get user info if logged in
        let customerInfo;
        if (userId) {
            const user = await User_1.default.findById(userId);
            if (user) {
                customerInfo = {
                    userId: userId,
                    name: name || user.name,
                    email: email || user.email,
                    phone: phone || user.phone,
                    deliveryAddress: deliveryAddress || user.address || ''
                };
            }
        }
        // If not logged in or user not found, use provided info
        if (!customerInfo) {
            if (!name || !email || !phone || !deliveryAddress) {
                return errorResponse(res, 'Name, email, phone, and delivery address are required for guest orders', 400);
            }
            customerInfo = {
                name,
                email,
                phone,
                deliveryAddress
            };
        }
        // Process items and calculate totals
        let subtotal = 0;
        const processedItems = [];
        for (const item of items) {
            // Validate item has foodId
            if (!item.foodId) {
                return errorResponse(res, 'Each item must have a foodId', 400);
            }
            // Get food details from database
            const food = await Food_1.default.findById(item.foodId);
            if (!food) {
                return errorResponse(res, `Food item with ID ${item.foodId} not found`, 404);
            }
            // Check if food is available
            if (food.status !== 'AVAILABLE' || !food.quantity_available) {
                return errorResponse(res, `Food item "${food.name}" is not available`, 400);
            }
            const quantity = item.quantity || 1;
            const price = food.price;
            const total = price * quantity;
            processedItems.push({
                foodId: food._id,
                name: food.name,
                price: price,
                quantity: quantity,
                total: total
            });
            subtotal += total;
        }
        // Create order
        const orderData = {
            customer: customerInfo,
            items: processedItems,
            subtotal: subtotal,
            totalAmount: subtotal,
            specialInstructions: specialInstructions || '',
            status: Order_1.OrderStatus.PENDING
        };
        const order = new Order_1.default(orderData);
        await order.save();
        // Populate order for response
        const populatedOrder = await Order_1.default.findById(order._id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email')
            .populate('assignedWaiter', 'name email');
        successResponse(res, populatedOrder, 'Order created successfully', 201);
    }
    catch (error) {
        console.error('Error creating order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.createOrder = createOrder;
// Get customer's orders (My Orders)
const getCustomerOrders = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, 'Please login to view your orders', 401);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        const skip = (page - 1) * limit;
        const filter = { 'customer.userId': userId };
        if (status) {
            filter.status = status;
        }
        const orders = await Order_1.default.find(filter)
            .populate('items.foodId', 'name price image category')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalOrders = await Order_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        successResponse(res, {
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }, 'Orders retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching customer orders:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getCustomerOrders = getCustomerOrders;
// Get specific order (Customer)
const getCustomerOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, 'Please login to view this order', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findOne({
            _id: id,
            'customer.userId': userId
        })
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('confirmedBy', 'name email');
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        successResponse(res, order, 'Order retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getCustomerOrder = getCustomerOrder;
// Cancel order (Customer)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, 'Please login to cancel this order', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findOne({
            _id: id,
            'customer.userId': userId
        });
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        // Check if order can be cancelled
        if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
            return errorResponse(res, `Order cannot be cancelled when status is ${order.status}`, 400);
        }
        await order.updateStatus(Order_1.OrderStatus.CANCELLED, undefined, reason || 'Cancelled by customer');
        successResponse(res, order, 'Order cancelled successfully');
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.cancelOrder = cancelOrder;
// ==================== MANAGER CONTROLLERS ====================
// Get all orders (Manager)
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || '';
        const search = req.query.search || '';
        const dateFrom = req.query.dateFrom || '';
        const dateTo = req.query.dateTo || '';
        const skip = (page - 1) * limit;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } }
            ];
        }
        if (dateFrom || dateTo) {
            filter.created_at = {};
            if (dateFrom)
                filter.created_at.$gte = new Date(dateFrom);
            if (dateTo)
                filter.created_at.$lte = new Date(dateTo + 'T23:59:59');
        }
        const orders = await Order_1.default.find(filter)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('confirmedBy', 'name email')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalOrders = await Order_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        successResponse(res, {
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }, 'Orders retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching all orders:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getAllOrders = getAllOrders;
// Get order by ID (Manager)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('confirmedBy', 'name email')
            .populate('customer.userId', 'name email phone');
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        successResponse(res, order, 'Order retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getOrderById = getOrderById;
// Confirm order (Manager)
const confirmOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.PENDING) {
            return errorResponse(res, `Order cannot be confirmed. Current status: ${order.status}`, 400);
        }
        await order.updateStatus(Order_1.OrderStatus.CONFIRMED, userId.toString());
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('confirmedBy', 'name email');
        successResponse(res, updatedOrder, 'Order confirmed successfully');
    }
    catch (error) {
        console.error('Error confirming order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.confirmOrder = confirmOrder;
// Reject/Cancel order (Manager)
const rejectOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.PENDING) {
            return errorResponse(res, `Order cannot be rejected. Current status: ${order.status}`, 400);
        }
        await order.updateStatus(Order_1.OrderStatus.CANCELLED, undefined, reason || 'Rejected by manager');
        successResponse(res, order, 'Order rejected successfully');
    }
    catch (error) {
        console.error('Error rejecting order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.rejectOrder = rejectOrder;
// Assign chef to order (Manager)
const assignChef = async (req, res) => {
    try {
        const { id } = req.params;
        const { chefId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id) || !mongoose_1.default.Types.ObjectId.isValid(chefId)) {
            return errorResponse(res, 'Invalid ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        // Check if chef exists and has chef role
        const chef = await User_1.default.findById(chefId);
        if (!chef) {
            return errorResponse(res, 'Chef not found', 404);
        }
        // In a real system, you'd check if user has chef role
        // For now, we'll allow any user to be assigned as chef
        order.assignedChef = chefId;
        await order.save();
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Chef assigned successfully');
    }
    catch (error) {
        console.error('Error assigning chef:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.assignChef = assignChef;
// Assign waiter to order (Manager)
const assignWaiter = async (req, res) => {
    try {
        const { id } = req.params;
        const { waiterId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id) || !mongoose_1.default.Types.ObjectId.isValid(waiterId)) {
            return errorResponse(res, 'Invalid ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        const waiter = await User_1.default.findById(waiterId);
        if (!waiter) {
            return errorResponse(res, 'Waiter not found', 404);
        }
        order.assignedWaiter = waiterId;
        await order.save();
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Waiter assigned successfully');
    }
    catch (error) {
        console.error('Error assigning waiter:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.assignWaiter = assignWaiter;
// ==================== CHEF CONTROLLERS ====================
// Get orders for chef (confirmed or preparing)
const getChefOrders = async (req, res) => {
    try {
        const chefId = req.user?._id;
        if (!chefId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        const status = req.query.status || '';
        const filter = {};
        // Only show CONFIRMED and PREPARING orders assigned to this chef
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = { $in: ['CONFIRMED', 'PREPARING'] };
        }
        // If chef is assigned to order, show it
        filter.$or = [
            { assignedChef: chefId },
            { assignedChef: { $exists: false } } // Or unassigned orders
        ];
        const orders = await Order_1.default.find(filter)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('customer.userId', 'name email phone')
            .sort({ created_at: 1 });
        successResponse(res, orders, 'Chef orders retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching chef orders:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getChefOrders = getChefOrders;
// Take order (Chef starts preparing)
const takeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const chefId = req.user?._id;
        if (!chefId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.CONFIRMED) {
            return errorResponse(res, `Order cannot be taken. Current status: ${order.status}`, 400);
        }
        // Assign chef if not already assigned
        if (!order.assignedChef) {
            order.assignedChef = chefId;
        }
        else if (order.assignedChef.toString() !== chefId.toString()) {
            return errorResponse(res, 'This order is already assigned to another chef', 400);
        }
        await order.updateStatus(Order_1.OrderStatus.PREPARING);
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Order taken and preparing started');
    }
    catch (error) {
        console.error('Error taking order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.takeOrder = takeOrder;
// Mark order as ready (Chef finished)
const markOrderReady = async (req, res) => {
    try {
        const { id } = req.params;
        const chefId = req.user?._id;
        if (!chefId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.PREPARING) {
            return errorResponse(res, `Order cannot be marked ready. Current status: ${order.status}`, 400);
        }
        // Verify chef is assigned to this order
        if (!order.assignedChef || order.assignedChef.toString() !== chefId.toString()) {
            return errorResponse(res, 'You are not assigned to this order', 403);
        }
        await order.updateStatus(Order_1.OrderStatus.READY);
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Order marked as ready for delivery');
    }
    catch (error) {
        console.error('Error marking order ready:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.markOrderReady = markOrderReady;
// ==================== WAITER CONTROLLERS ====================
// Get orders for waiter (ready or delivered)
const getWaiterOrders = async (req, res) => {
    try {
        const waiterId = req.user?._id;
        if (!waiterId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        const status = req.query.status || '';
        const filter = {};
        if (status) {
            filter.status = status;
        }
        else {
            filter.status = { $in: ['READY', 'DELIVERED'] };
        }
        // Show orders assigned to this waiter or unassigned ready orders
        filter.$or = [
            { assignedWaiter: waiterId },
            { assignedWaiter: { $exists: false } }
        ];
        const orders = await Order_1.default.find(filter)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone')
            .populate('customer.userId', 'name email phone')
            .sort({ readyAt: 1 });
        successResponse(res, orders, 'Waiter orders retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching waiter orders:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getWaiterOrders = getWaiterOrders;
// Take order for delivery (Waiter)
const takeDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const waiterId = req.user?._id;
        if (!waiterId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.READY) {
            return errorResponse(res, `Order cannot be taken for delivery. Current status: ${order.status}`, 400);
        }
        // Assign waiter if not already assigned
        if (!order.assignedWaiter) {
            order.assignedWaiter = waiterId;
        }
        else if (order.assignedWaiter.toString() !== waiterId.toString()) {
            return errorResponse(res, 'This order is  already assigned to another waiter', 400);
        }
        order.status = Order_1.OrderStatus.DELIVERING;
        await order.save();
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Delivery taken successfully');
    }
    catch (error) {
        console.error('Error taking delivery:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.takeDelivery = takeDelivery;
// Mark order as delivered (Waiter)
const markDelivered = async (req, res) => {
    try {
        const { id } = req.params;
        const waiterId = req.user?._id;
        if (!waiterId) {
            return errorResponse(res, 'Authentication required', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        if (order.status !== Order_1.OrderStatus.DELIVERING) {
            return errorResponse(res, `Order cannot be delivered. Current status: ${order.status}`, 400);
        }
        // Verify waiter is assigned to this order
        if (!order.assignedWaiter || order.assignedWaiter.toString() !== waiterId.toString()) {
            return errorResponse(res, 'You are not assigned to this order', 403);
        }
        await order.updateStatus(Order_1.OrderStatus.DELIVERED);
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Order marked as delivered');
    }
    catch (error) {
        console.error('Error marking order delivered:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.markDelivered = markDelivered;
// ==================== ADMIN/MANAGER EXTRA ====================
// Get order statistics (Manager/Admin)
const getOrderStatistics = async (req, res) => {
    try {
        const stats = await Order_1.default.getStatistics();
        // Get daily stats for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyStats = await Order_1.default.aggregate([
            {
                $match: {
                    created_at: { $gte: sevenDaysAgo },
                    status: { $in: ['DELIVERED', 'COMPLETED'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        // Get recent orders (last 10)
        const recentOrders = await Order_1.default.find()
            .populate('customer.userId', 'name email')
            .sort({ created_at: -1 })
            .limit(10);
        successResponse(res, {
            ...stats,
            dailyStats,
            recentOrders
        }, 'Statistics retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching order statistics:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getOrderStatistics = getOrderStatistics;
// Get all statuses
const getOrderStatuses = async (req, res) => {
    try {
        const statuses = Object.values(Order_1.OrderStatus).map(status => ({
            value: status,
            label: status.charAt(0) + status.slice(1).toLowerCase()
        }));
        successResponse(res, statuses, 'Order statuses retrieved successfully');
    }
    catch (error) {
        errorResponse(res, error.message, 500);
    }
};
exports.getOrderStatuses = getOrderStatuses;
// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        if (!Object.values(Order_1.OrderStatus).includes(status)) {
            return errorResponse(res, 'Invalid status', 400);
        }
        const order = await Order_1.default.findById(id);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        await order.updateStatus(status, undefined, reason);
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, `Order status updated to ${status}`);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// ==================== RATING CONTROLLERS ====================
// Rate an order (Customer)
const rateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, 'Please login to rate this order', 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const ratingNum = Number(rating);
        if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
            return errorResponse(res, 'Rating must be between 1 and 5', 400);
        }
        const order = await Order_1.default.findOne({
            _id: id,
            'customer.userId': userId
        });
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        // Check if already rated first
        if (order.status === Order_1.OrderStatus.RATED) {
            return errorResponse(res, 'Order has already been rated', 400);
        }
        // Check if order is delivered (can only rate delivered orders)
        if (order.status !== Order_1.OrderStatus.DELIVERED) {
            return errorResponse(res, `Order must be delivered before rating. Current status: ${order.status}`, 400);
        }
        // Update the order with rating
        order.rating = ratingNum;
        if (comment && comment.trim()) {
            order.ratingComment = comment.trim();
        }
        order.status = Order_1.OrderStatus.RATED;
        order.ratedAt = new Date();
        await order.save();
        const updatedOrder = await Order_1.default.findById(id)
            .populate('items.foodId', 'name price image category')
            .populate('assignedChef', 'name email phone')
            .populate('assignedWaiter', 'name email phone');
        successResponse(res, updatedOrder, 'Order rated successfully');
    }
    catch (error) {
        console.error('Error rating order:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.rateOrder = rateOrder;
// Get order rating (Public)
const getOrderRating = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return errorResponse(res, 'Invalid order ID', 400);
        }
        const order = await Order_1.default.findById(id).select('rating ratingComment ratedAt status');
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        successResponse(res, {
            rating: order.rating || null,
            comment: order.ratingComment || null,
            ratedAt: order.ratedAt || null,
            status: order.status
        }, 'Order rating retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching order rating:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getOrderRating = getOrderRating;
// Add this new controller function for public ratings
const getFoodRatings = async (req, res) => {
    try {
        const { foodId } = req.params;
        // Find all rated orders for this food
        const orders = await Order_1.default.find({
            'items.foodId': foodId,
            rating: { $exists: true, $ne: null },
            status: { $in: ['RATED', 'COMPLETED'] }
        }).select('rating ratingComment customer.name ratedAt');
        if (!orders || orders.length === 0) {
            return successResponse(res, {
                average: 0,
                count: 0,
                ratings: []
            }, 'No ratings found for this food');
        }
        // Calculate average
        const totalRating = orders.reduce((sum, order) => sum + (order.rating || 0), 0);
        const average = totalRating / orders.length;
        // Format ratings
        const ratings = orders.map(order => ({
            rating: order.rating,
            comment: order.ratingComment || '',
            customerName: order.customer.name,
            ratedAt: order.ratedAt || order.created_at
        }));
        successResponse(res, {
            average: Number(average.toFixed(1)),
            count: orders.length,
            ratings
        }, 'Food ratings retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching food ratings:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getFoodRatings = getFoodRatings;
// Get all food ratings summary (for multiple foods at once)
const getAllFoodRatings = async (req, res) => {
    try {
        // Get all rated orders
        const orders = await Order_1.default.find({
            rating: { $exists: true, $ne: null },
            status: { $in: ['RATED', 'COMPLETED'] }
        }).select('rating ratingComment customer.name items.foodId ratedAt');
        // Group by foodId
        const ratingsMap = new Map();
        orders.forEach(order => {
            order.items.forEach(item => {
                const foodId = item.foodId.toString();
                if (!ratingsMap.has(foodId)) {
                    ratingsMap.set(foodId, {
                        ratings: [],
                        total: 0,
                        count: 0
                    });
                }
                const foodRating = ratingsMap.get(foodId);
                foodRating.ratings.push({
                    rating: order.rating || 0,
                    comment: order.ratingComment || '',
                    customerName: order.customer.name,
                    ratedAt: order.ratedAt || order.created_at
                });
                foodRating.total += order.rating || 0;
                foodRating.count += 1;
            });
        });
        // Calculate averages with proper typing
        const result = {};
        ratingsMap.forEach((value, foodId) => {
            result[foodId] = {
                average: Number((value.total / value.count).toFixed(1)),
                count: value.count,
                ratings: value.ratings
            };
        });
        successResponse(res, result, 'All food ratings retrieved successfully');
    }
    catch (error) {
        console.error('Error fetching all food ratings:', error);
        errorResponse(res, error.message, 500);
    }
};
exports.getAllFoodRatings = getAllFoodRatings;
