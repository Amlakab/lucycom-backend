import { Request, Response } from 'express';
import Solution, { ISolution } from '../models/Solution';
import { successResponse, errorResponse, paginate } from '../utils/response';

// ========== PUBLIC ==========
export const getPublicSolutions = async (req: Request, res: Response) => {
  try {
    const { featured, limit = 20, page = 1 } = req.query;
    const filter: any = {};
    if (featured === 'true') filter.featured = true;

    const result = await paginate(Solution, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getPublicSolution = async (req: Request, res: Response) => {
  try {
    const solution = await Solution.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    });
    if (!solution) return errorResponse(res, 'Solution not found', 404);
    successResponse(res, solution);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

// ========== ADMIN ==========
export const getAllSolutions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, featured } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (featured !== undefined) filter.featured = featured === 'true';

    const result = await paginate(Solution, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createSolution = async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (req.file) {
      data.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
    }
    if (typeof data.features === 'string') {
      try {
        data.features = JSON.parse(data.features);
      } catch {
        data.features = data.features.split(',').map((s: string) => s.trim());
      }
    }
    if (typeof data.keyTechnologies === 'string') {
      try {
        data.keyTechnologies = JSON.parse(data.keyTechnologies);
      } catch {
        data.keyTechnologies = data.keyTechnologies.split(',').map((s: string) => s.trim());
      }
    }
    if (typeof data.order === 'string') data.order = Number(data.order);
    if (typeof data.featured === 'string') data.featured = data.featured === 'true';

    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const solution = await Solution.create(data);
    successResponse(res, solution, 'Solution created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateSolution = async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (req.file) {
      data.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
    }
    if (typeof data.features === 'string') {
      try {
        data.features = JSON.parse(data.features);
      } catch {
        data.features = data.features.split(',').map((s: string) => s.trim());
      }
    }
    if (typeof data.keyTechnologies === 'string') {
      try {
        data.keyTechnologies = JSON.parse(data.keyTechnologies);
      } catch {
        data.keyTechnologies = data.keyTechnologies.split(',').map((s: string) => s.trim());
      }
    }
    if (typeof data.order === 'string') data.order = Number(data.order);
    if (typeof data.featured === 'string') data.featured = data.featured === 'true';

    const solution = await Solution.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!solution) return errorResponse(res, 'Solution not found', 404);
    successResponse(res, solution, 'Solution updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteSolution = async (req: Request, res: Response) => {
  try {
    const solution = await Solution.findByIdAndDelete(req.params.id);
    if (!solution) return errorResponse(res, 'Solution not found', 404);
    successResponse(res, null, 'Solution deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const toggleSolutionFeatured = async (req: Request, res: Response) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return errorResponse(res, 'Solution not found', 404);

    solution.featured = !solution.featured;
    await solution.save();
    successResponse(res, solution, 'Featured status updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};
