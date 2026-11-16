import { Request, Response } from 'express';
import Project, { IProject, ProjectCategory } from '../models/Project';
import { successResponse, errorResponse, paginate } from '../utils/response';

// ========== PUBLIC ==========
export const getPublicProjects = async (req: Request, res: Response) => {
  try {
    const { featured, category, limit = 12, page = 1 } = req.query;
    const filter: any = {};
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = category;

    const result = await paginate(Project, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getPublicProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);
    successResponse(res, project);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

// ========== ADMIN ==========
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category, featured } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    const result = await paginate(Project, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, tags, github, liveUrl, category, featured, order } = req.body;
    let image = '';
    let imageData = undefined;

    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      image = `/uploads/projects/${Date.now()}-${req.file.originalname}`;
    }

    const project = new Project({
      title,
      description,
      image,
      imageData,
      tags: tags ? JSON.parse(tags) : [],
      github,
      liveUrl,
      category,
      featured: featured === 'true',
      order: Number(order) || 0,
    });

    await project.save();
    successResponse(res, project, 'Project created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      updateData.image = `/uploads/projects/${Date.now()}-${req.file.originalname}`;
    }
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.featured) updateData.featured = updateData.featured === 'true';
    if (updateData.order) updateData.order = Number(updateData.order);

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    successResponse(res, updated, 'Project updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);
    successResponse(res, null, 'Project deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);
    project.featured = !project.featured;
    await project.save();
    successResponse(res, project, `Featured ${project.featured ? 'enabled' : 'disabled'}`);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};