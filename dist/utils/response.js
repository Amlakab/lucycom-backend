"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = exports.errorResponse = exports.successResponse = void 0;
// ----------------------------------------------------------------------
// Response helpers
// ----------------------------------------------------------------------
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'Error', statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        message,
    });
};
exports.errorResponse = errorResponse;
// ----------------------------------------------------------------------
// Paginate function – Cleaned TypeScript types
// ----------------------------------------------------------------------
const paginate = async (model, filter = {}, options) => {
    const { page, limit, sort = { created_at: -1 }, select = '', populate } = options;
    const skip = (page - 1) * limit;
    // Build the base query
    const query = model.find(filter).sort(sort).skip(skip).limit(limit);
    if (select) {
        query.select(select);
    }
    if (populate) {
        query.populate(populate);
    }
    // Execute and cast the output clean to T[]
    const data = (await query.exec());
    const totalItems = await model.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.paginate = paginate;
