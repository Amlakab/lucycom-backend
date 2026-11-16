import { Request, Response } from 'express';
import Experience from '../models/Experience';
import { successResponse, errorResponse, paginate } from '../utils/response';

export const getPublicExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, created_at: -1 });
    successResponse(res, experiences);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Experience, {}, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createExperience = async (req: Request, res: Response) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    successResponse(res, experience, 'Experience created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return errorResponse(res, 'Experience not found', 404);
    successResponse(res, updated, 'Experience updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return errorResponse(res, 'Experience not found', 404);
    successResponse(res, null, 'Experience deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};