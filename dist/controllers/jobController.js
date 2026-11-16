"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobStats = exports.getAllJobsByStudentId = exports.deleteJob = exports.updateJob = exports.assignJob = exports.getEligibleStudents = exports.getJobs = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Student_1 = __importDefault(require("../models/Student"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all job assignments for the current user's class
const getJobs = async (req, res) => {
    try {
        // Get user role from auth middleware
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'User role not found',
            });
        }
        // Extract query parameters
        const { page = 1, limit = 10, search = '', sub_class: subClassStatusFilter = '', // For status: "assigned" or "not_assigned"
        sub_class_value = '' // For specific value like "Timhrt", "Mikikir"
         } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build query - only show jobs for current user's class
        let query = { class: userRole };
        // Handle specific sub-class value filter
        if (sub_class_value && sub_class_value !== '') {
            query.sub_class = sub_class_value;
        }
        // Handle sub-class status filter (only if no specific value is provided)
        else if (subClassStatusFilter) {
            if (subClassStatusFilter === 'assigned') {
                query.sub_class = { $ne: null, $exists: true };
            }
            else if (subClassStatusFilter === 'not_assigned') {
                query.sub_class = { $in: [null, ''] };
            }
        }
        // Note: If neither is provided, we get all jobs
        // If search is provided, search in student fields
        if (search) {
            const students = await Student_1.default.find({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { middleName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { gibyGubayeId: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');
            const studentIds = students.map(student => student._id);
            // Handle the case where studentId might already be in query
            if (query.studentId) {
                query.$and = [
                    { studentId: query.studentId },
                    { studentId: { $in: studentIds } }
                ];
                delete query.studentId;
            }
            else {
                query.studentId = { $in: studentIds };
            }
        }
        // Execute query
        const jobs = await Job_1.default.find(query)
            .populate('studentId', 'firstName middleName lastName phone email college department region photo numberOfJob isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .exec();
        const totalJobs = await Job_1.default.countDocuments(query);
        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalJobs / Number(limit)),
                    totalJobs,
                    hasNext: Number(page) * Number(limit) < totalJobs,
                    hasPrev: Number(page) > 1,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getJobs = getJobs;
// Get students eligible for job assignment (less than 3 jobs and not already assigned current class)
const getEligibleStudents = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const { search = '' } = req.query;
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'User role not found',
            });
        }
        // Find students with numberOfJob < 3
        let query = { numberOfJob: { $lt: 3 } };
        // Search filter
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { middleName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { gibyGubayeId: { $regex: search, $options: 'i' } },
            ];
        }
        const students = await Student_1.default.find(query)
            .sort({ firstName: 1 })
            .limit(50);
        // Filter out students already assigned to current class
        const jobs = await Job_1.default.find({ class: userRole }).select('studentId');
        const assignedStudentIds = jobs.map(job => job.studentId.toString());
        const eligibleStudents = students.filter(student => !assignedStudentIds.includes(student._id.toString()));
        res.json({
            success: true,
            data: eligibleStudents,
        });
    }
    catch (error) {
        console.error('Error fetching eligible students:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getEligibleStudents = getEligibleStudents;
// Assign job to student
const assignJob = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const { studentId } = req.body;
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'User role not found',
            });
        }
        // Check if student exists
        const student = await Student_1.default.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }
        // Check if student already has 3 jobs
        if (student.numberOfJob >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Student already has maximum 3 job assignments',
            });
        }
        // Check if student already has job with same class
        const existingJob = await Job_1.default.findOne({
            studentId,
            class: userRole,
        });
        if (existingJob) {
            return res.status(400).json({
                success: false,
                message: 'Student already assigned to this class',
            });
        }
        // Create job assignment
        const job = new Job_1.default({
            studentId,
            class: userRole,
            sub_class: null,
            type: 'member', // Default type
            background: null,
        });
        await job.save();
        // Update student's numberOfJob
        student.numberOfJob += 1;
        await student.save();
        // Populate student data for response
        const populatedJob = await Job_1.default.findById(job._id).populate('studentId');
        res.status(201).json({
            success: true,
            data: populatedJob,
            message: 'Job assigned successfully',
        });
    }
    catch (error) {
        console.error('Error assigning job:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.assignJob = assignJob;
// Update job sub-class, type, and background
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { sub_class, type, background } = req.body;
        const userRole = req.user?.role;
        const job = await Job_1.default.findById(id).populate('studentId');
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job assignment not found',
            });
        }
        // Verify job belongs to user's class
        if (job.class !== userRole) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job',
            });
        }
        // Check for duplicate type in same sub-class
        if (sub_class && type && type !== 'member') {
            // For leader, sub_leader, Secretary - only one allowed per sub-class
            const existingJobWithSameType = await Job_1.default.findOne({
                _id: { $ne: id }, // Exclude current job
                class: userRole,
                sub_class: sub_class,
                type: type,
            });
            if (existingJobWithSameType) {
                return res.status(400).json({
                    success: false,
                    message: `${type} already exists in this sub-class. Only one ${type} is allowed per sub-class.`,
                });
            }
        }
        // Update fields
        if (sub_class !== undefined)
            job.sub_class = sub_class;
        if (type !== undefined)
            job.type = type;
        if (background !== undefined)
            job.background = background;
        await job.save();
        res.json({
            success: true,
            data: job,
            message: 'Job updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateJob = updateJob;
// Delete job assignment
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;
        const job = await Job_1.default.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job assignment not found',
            });
        }
        // Verify job belongs to user's class
        if (job.class !== userRole) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job',
            });
        }
        // Delete the job
        await Job_1.default.findByIdAndDelete(id);
        // Decrement student's numberOfJob
        await Student_1.default.findByIdAndUpdate(job.studentId, {
            $inc: { numberOfJob: -1 },
        });
        res.json({
            success: true,
            message: 'Job assignment deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteJob = deleteJob;
const getAllJobsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Validate studentId
        if (!mongoose_1.default.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID format',
            });
        }
        // Find all jobs for this student (across all classes)
        const jobs = await Job_1.default.find({ studentId })
            .populate('studentId', 'firstName middleName lastName phone email college department region photo numberOfJob isActive')
            .sort({ createdAt: -1 })
            .exec();
        // Get student info
        const student = await Student_1.default.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }
        res.json({
            success: true,
            data: {
                jobs,
                studentInfo: {
                    _id: student._id,
                    firstName: student.firstName,
                    middleName: student.middleName,
                    lastName: student.lastName,
                    fullName: `${student.firstName} ${student.lastName}`,
                    phone: student.phone,
                    email: student.email,
                    college: student.college,
                    department: student.department,
                    region: student.region,
                    numberOfJob: student.numberOfJob,
                    isActive: student.isActive,
                    createdAt: student.createdAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching all jobs by student ID:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAllJobsByStudentId = getAllJobsByStudentId;
// Get job statistics
const getJobStats = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const totalJobs = await Job_1.default.countDocuments({ class: userRole });
        const assignedWithSubClass = await Job_1.default.countDocuments({
            class: userRole,
            sub_class: { $ne: null, $exists: true },
        });
        // Count by sub_class
        const subClassStats = await Job_1.default.aggregate([
            { $match: { class: userRole, sub_class: { $ne: null, $exists: true } } },
            { $group: { _id: '$sub_class', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // Count by type
        const typeStats = await Job_1.default.aggregate([
            { $match: { class: userRole } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({
            success: true,
            data: {
                totalJobs,
                assignedWithSubClass,
                withoutSubClass: totalJobs - assignedWithSubClass,
                subClassStats,
                typeStats,
            },
        });
    }
    catch (error) {
        console.error('Error getting job stats:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getJobStats = getJobStats;
