"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStatistics = exports.deleteUser = exports.changePassword = exports.updateUser = exports.updateUserStatus = exports.createUser = exports.getUser = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all users with filtering and pagination
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build query
        let query = {};
        // Role filter
        if (role) {
            query.role = role;
        }
        // Status filter
        if (status) {
            if (status === 'active') {
                query.isActive = true;
            }
            else if (status === 'inactive') {
                query.isActive = false;
            }
        }
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        // Execute query
        const users = await User_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .exec();
        const totalUsers = await User_1.default.countDocuments(query);
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalUsers / Number(limit)),
                    totalUsers,
                    hasNext: Number(page) * Number(limit) < totalUsers,
                    hasPrev: Number(page) > 1,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format',
            });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getUser = getUser;
// Create new user
const createUser = async (req, res) => {
    try {
        const { name, email, phone, background, password, role } = req.body;
        // Check if user already exists with email or phone
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { phone }],
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already exists'
                    : 'Phone number already exists',
            });
        }
        // Create new user
        const user = new User_1.default({
            name,
            email,
            phone,
            background,
            password,
            role: role || 'user',
            isActive: true,
        });
        await user.save();
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully',
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createUser = createUser;
// Update user status (active/inactive)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const user = await User_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.json({
            success: true,
            data: user,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
    }
    catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateUserStatus = updateUserStatus;
// Update user information
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, background, role } = req.body;
        // Check if user exists
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingEmail = await User_1.default.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                });
            }
        }
        // Check if phone is being changed and if it's already taken
        if (phone && phone !== user.phone) {
            const existingPhone = await User_1.default.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists',
                });
            }
        }
        // Update user
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, {
            name,
            email,
            phone,
            background,
            role,
        }, { new: true });
        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateUser = updateUser;
// Change user password
const changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.changePassword = changePassword;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteUser = deleteUser;
// Get user statistics
const getUserStatistics = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments({ isActive: true });
        const blockedUsers = await User_1.default.countDocuments({ isActive: false });
        // Count by role
        const roles = await User_1.default.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                blockedUsers,
                roles,
            },
        });
    }
    catch (error) {
        console.error('Error getting user statistics:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getUserStatistics = getUserStatistics;
