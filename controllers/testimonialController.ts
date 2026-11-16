import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';
import { successResponse, errorResponse, paginate } from '../utils/response';

export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const { featured } = req.query;
    const filter: any = {};
    if (featured === 'true') filter.featured = true;
    const testimonials = await Testimonial.find(filter)
      .sort({ order: 1, created_at: -1 });
    successResponse(res, testimonials);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await paginate(Testimonial, {}, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, role, content, rating, featured, order } = req.body;
    let avatar = '';
    let avatarData = undefined;

    if (req.file) {
      avatarData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      avatar = `/uploads/testimonials/${Date.now()}-${req.file.originalname}`;
    }

    const testimonial = new Testimonial({
      name,
      role,
      content,
      avatar,
      avatarData,
      rating: Number(rating),
      featured: featured === 'true',
      order: Number(order) || 0,
    });

    await testimonial.save();
    successResponse(res, testimonial, 'Testimonial created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return errorResponse(res, 'Testimonial not found', 404);

    const updateData = { ...req.body };
    if (req.file) {
      updateData.avatarData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      updateData.avatar = `/uploads/testimonials/${Date.now()}-${req.file.originalname}`;
    }
    if (updateData.rating) updateData.rating = Number(updateData.rating);
    if (updateData.featured) updateData.featured = updateData.featured === 'true';
    if (updateData.order) updateData.order = Number(updateData.order);

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    successResponse(res, updated, 'Testimonial updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) return errorResponse(res, 'Testimonial not found', 404);
    successResponse(res, null, 'Testimonial deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const toggleTestimonialFeatured = async (req: Request, res: Response) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return errorResponse(res, 'Testimonial not found', 404);
    testimonial.featured = !testimonial.featured;
    await testimonial.save();
    successResponse(res, testimonial, `Featured ${testimonial.featured ? 'enabled' : 'disabled'}`);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};