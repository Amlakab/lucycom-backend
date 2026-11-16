import { Response } from 'express';
import { Model, Document } from 'mongoose';

// ----------------------------------------------------------------------
// Response helpers
// ----------------------------------------------------------------------

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500
): void => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

// ----------------------------------------------------------------------
// Pagination types
// ----------------------------------------------------------------------

interface PaginateOptions {
  page: number;
  limit: number;
  sort?: any;
  select?: string;
  populate?: any;
}

interface PaginateResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ----------------------------------------------------------------------
// Paginate function – Cleaned TypeScript types
// ----------------------------------------------------------------------

export const paginate = async <T>(
  model: Model<T>,
  filter: Record<string, any> = {},
  options: PaginateOptions
): Promise<PaginateResult<T>> => {
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
  const data = (await query.exec()) as unknown as T[];

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