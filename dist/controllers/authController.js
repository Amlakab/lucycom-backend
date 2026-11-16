"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getProfile = exports.loginWithOtp = exports.sendOtp = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const otpGenerator_1 = require("../utils/otpGenerator");
const helpers_1 = require("../utils/helpers");
const register = async (req, res) => {
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
            role: role || 'customer', // Default role is 'customer'
            isActive: true,
        });
        await user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // CORRECT RESPONSE FORMAT
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    background: user.background,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            },
            message: 'Registration successful'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phone, email, identifier: rawId, password } = req.body;
        const identifier = (phone || email || rawId || '').trim();
        if (!identifier || !password) {
            return (0, helpers_1.errorResponse)(res, 'Please provide your phone or email and password', 400);
        }
        // Find user by phone or email
        const user = await User_1.default.findOne({
            $or: [
                { phone: identifier },
                { email: identifier.toLowerCase() },
            ],
        });
        if (!user) {
            return (0, helpers_1.errorResponse)(res, 'Invalid credentials', 400);
        }
        // Check if user is active
        if (!user.isActive) {
            return (0, helpers_1.errorResponse)(res, 'Your account has been deactivated. Please contact support.', 403);
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return (0, helpers_1.errorResponse)(res, 'Invalid credentials', 400);
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        (0, helpers_1.successResponse)(res, {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                background: user.background,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }, 'Login successful');
    }
    catch (error) {
        (0, helpers_1.errorResponse)(res, error.message, 500);
    }
};
exports.login = login;
const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ phone });
        if (!user) {
            return (0, helpers_1.errorResponse)(res, 'User not found', 404);
        }
        // Generate OTP
        const otp = (0, otpGenerator_1.generateOTP)();
        (0, otpGenerator_1.storeOTP)(phone, otp);
        // In a real application, you would send the OTP via SMS
        // For development, we'll return it in the response
        console.log(`OTP for ${phone}: ${otp}`);
        (0, helpers_1.successResponse)(res, { otp: process.env.NODE_ENV === 'development' ? otp : null }, 'OTP sent successfully');
    }
    catch (error) {
        (0, helpers_1.errorResponse)(res, error.message, 500);
    }
};
exports.sendOtp = sendOtp;
const loginWithOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ phone });
        if (!user) {
            return (0, helpers_1.errorResponse)(res, 'User not found', 404);
        }
        // Verify OTP
        if (!(0, otpGenerator_1.verifyOTP)(phone, otp)) {
            return (0, helpers_1.errorResponse)(res, 'Invalid or expired OTP', 400);
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        (0, helpers_1.successResponse)(res, {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                background: user.background,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }, 'Login successful');
    }
    catch (error) {
        (0, helpers_1.errorResponse)(res, error.message, 500);
    }
};
exports.loginWithOtp = loginWithOtp;
const getProfile = async (req, res) => {
    try {
        // Assuming req.user is set by authentication middleware
        const user = req.user;
        if (!user) {
            return (0, helpers_1.errorResponse)(res, 'User not found', 404);
        }
        (0, helpers_1.successResponse)(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            background: user.background,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, 'Profile retrieved successfully');
    }
    catch (error) {
        (0, helpers_1.errorResponse)(res, error.message, 500);
    }
};
exports.getProfile = getProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return (0, helpers_1.errorResponse)(res, 'User not found', 404);
        }
        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return (0, helpers_1.errorResponse)(res, 'Current password is incorrect', 400);
        }
        // Update password
        user.password = newPassword;
        await user.save();
        (0, helpers_1.successResponse)(res, null, 'Password updated successfully');
    }
    catch (error) {
        (0, helpers_1.errorResponse)(res, error.message, 500);
    }
};
exports.changePassword = changePassword;
