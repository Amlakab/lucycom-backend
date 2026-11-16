import { Request, Response } from 'express';
import Education from '../models/Education';
import { successResponse, errorResponse, paginate } from '../utils/response';

export const getPublicEducations = async (req: Request, res: Response) => {
  try {
    const educations = await Education.find().sort({ order: 1, created_at: -1 });
    successResponse(res, educations);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getAllEducations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Education, {}, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createEducation = async (req: Request, res: Response) => {
  try {
    const education = new Education(req.body);
    await education.save();
    successResponse(res, education, 'Education created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateEducation = async (req: Request, res: Response) => {
  try {
    const updated = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return errorResponse(res, 'Education not found', 404);
    successResponse(res, updated, 'Education updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const deleted = await Education.findByIdAndDelete(req.params.id);
    if (!deleted) return errorResponse(res, 'Education not found', 404);
    successResponse(res, null, 'Education deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};