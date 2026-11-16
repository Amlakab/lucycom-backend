import { Request, Response } from 'express';
import Skill from '../models/Skill';
import { successResponse, errorResponse, paginate } from '../utils/response';

export const getPublicSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    successResponse(res, skills);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const filter: any = {};
    if (category) filter.category = category;

    const result = await paginate(Skill, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { category: 1, order: 1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    successResponse(res, skill, 'Skill created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    const updated = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return errorResponse(res, 'Skill not found', 404);
    successResponse(res, updated, 'Skill updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const deleted = await Skill.findByIdAndDelete(req.params.id);
    if (!deleted) return errorResponse(res, 'Skill not found', 404);
    successResponse(res, null, 'Skill deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};