// controllers/certificationController.ts
import { Request, Response } from 'express';
import Certification from '../models/Certification';
import { successResponse, errorResponse, paginate } from '../utils/response';

// ========== PUBLIC ==========
export const getPublicCertifications = async (req: Request, res: Response) => {
  try {
    const certifications = await Certification.find()
      .sort({ category: 1, startDate: -1 })
      .lean();

    // Group by category
    const groupedCertifications = certifications.reduce((acc: any, cert) => {
      if (!acc[cert.category]) {
        acc[cert.category] = [];
      }
      acc[cert.category].push(cert);
      return acc;
    }, {});

    successResponse(res, groupedCertifications);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getPublicCertification = async (req: Request, res: Response) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    successResponse(res, certification);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

// ========== ADMIN ==========
export const getAllCertifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      filter.category = category;
    }

    const result = await paginate(Certification, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { category: 1, startDate: -1 },
    });
    
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      organization, 
      description, 
      startDate, 
      endDate, 
      category, 
      credentialId,
      credentialUrl,
      featured 
    } = req.body;

    let image = '';
    let imageData = undefined;

    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      image = `/uploads/certifications/${Date.now()}-${req.file.originalname}`;
    }

    const certification = new Certification({
      title,
      organization,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      image,
      imageData,
      category,
      credentialId,
      credentialUrl,
      featured: featured === 'true' || featured === true,
    });

    await certification.save();
    successResponse(res, certification, 'Certification created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }

    const updateData: any = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      updateData.image = `/uploads/certifications/${Date.now()}-${req.file.originalname}`;
    }

    // Parse dates
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Parse featured boolean
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    const updated = await Certification.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    successResponse(res, updated, 'Certification updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const deleted = await Certification.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return errorResponse(res, 'Certification not found', 404);
    }
    successResponse(res, null, 'Certification deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const toggleFeaturedd = async (req: Request, res: Response) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return errorResponse(res, 'Certification not found', 404);
    }
    
    certification.featured = !certification.featured;
    await certification.save();
    
    successResponse(res, certification, `Featured ${certification.featured ? 'enabled' : 'disabled'}`);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};