import { Request, Response } from 'express';
import Partner, { IPartner } from '../models/Partner';
import { successResponse, errorResponse, paginate } from '../utils/response';

// ========== PUBLIC ==========
export const getPublicPartners = async (req: Request, res: Response) => {
  try {
    const { featured, limit = 50, page = 1 } = req.query;
    const filter: any = {};
    if (featured === 'true') filter.featured = true;

    const result = await paginate(Partner, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getPublicPartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return errorResponse(res, 'Partner not found', 404);
    successResponse(res, partner);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

// ========== ADMIN ==========
export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, featured } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (featured !== undefined) filter.featured = featured === 'true';

    const result = await paginate(Partner, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { order: 1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createPartner = async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (req.file) {
      data.logoData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
    }
    if (typeof data.order === 'string') data.order = Number(data.order);
    if (typeof data.featured === 'string') data.featured = data.featured === 'true';

    const partner = await Partner.create(data);
    successResponse(res, partner, 'Partner created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (req.file) {
      data.logoData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
    }
    if (typeof data.order === 'string') data.order = Number(data.order);
    if (typeof data.featured === 'string') data.featured = data.featured === 'true';

    const partner = await Partner.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!partner) return errorResponse(res, 'Partner not found', 404);
    successResponse(res, partner, 'Partner updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return errorResponse(res, 'Partner not found', 404);
    successResponse(res, null, 'Partner deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const togglePartnerFeatured = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return errorResponse(res, 'Partner not found', 404);

    partner.featured = !partner.featured;
    await partner.save();
    successResponse(res, partner, 'Featured status updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};
