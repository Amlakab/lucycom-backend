import { Request, Response } from 'express';
import SiteSettings, { ISiteSettings } from '../models/SiteSettings';
import { successResponse, errorResponse } from '../utils/response';

export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    let settings: any = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.getSettings();
    }
    successResponse(res, settings);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    let settings: any = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.getSettings();
    }
    successResponse(res, settings);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateSiteSettings = async (req: Request, res: Response) => {
  try {
    console.log('🔵 Update Settings Request Received');
    
    let settings: any = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.getSettings();
    }

    if (!settings) {
      return errorResponse(res, 'Settings not found', 404);
    }

    const multerReq = req as any;
    const files = multerReq.files;
    const updateData: any = {};

    // Helper to safely parse JSON strings or objects
    const parseField = (fieldVal: any) => {
      if (!fieldVal) return null;
      if (typeof fieldVal === 'string') {
        try {
          return JSON.parse(fieldVal);
        } catch {
          return fieldVal;
        }
      }
      return fieldVal;
    };

    if (req.body.company) updateData.company = parseField(req.body.company);
    if (req.body.hero) updateData.hero = parseField(req.body.hero);
    if (req.body.about) updateData.about = parseField(req.body.about);
    if (req.body.solutionsSection) updateData.solutionsSection = parseField(req.body.solutionsSection);
    if (req.body.partnersSection) updateData.partnersSection = parseField(req.body.partnersSection);
    if (req.body.whyChooseUs) updateData.whyChooseUs = parseField(req.body.whyChooseUs);
    if (req.body.contact) updateData.contact = parseField(req.body.contact);
    if (req.body.stats) updateData.stats = parseField(req.body.stats);
    if (req.body.seo) updateData.seo = parseField(req.body.seo);

    // 2. Handle about image upload
    let aboutImageFile = null;
    if (files) {
      if (Array.isArray(files)) {
        aboutImageFile = files.find((f: any) => f.fieldname === 'aboutImage');
      } else if (files.aboutImage && files.aboutImage.length > 0) {
        aboutImageFile = files.aboutImage[0];
      }
    }

    if (aboutImageFile) {
      const aboutImageUrl = `/uploads/settings/about-${Date.now()}-${aboutImageFile.originalname}`;
      const aboutImageData = {
        data: aboutImageFile.buffer,
        contentType: aboutImageFile.mimetype,
        fileName: aboutImageFile.originalname,
      };
      updateData.about = {
        ...(updateData.about || settings.about || {}),
        imageData: aboutImageData,
        image: aboutImageUrl,
      };
    }
    
    // 3. Handle about image removal
    if (req.body.removeAboutImage === 'true') {
      updateData.about = {
        ...(updateData.about || settings.about || {}),
        imageData: undefined,
        image: '',
      };
    }

    // 4. Handle profile images upload and removal
    const currentProfileImagesData = settings.hero?.profileImagesData || [];
    const currentProfileImages = settings.hero?.profileImages || [];
    
    let removedIndices: number[] = [];
    if (req.body.removedProfileImages) {
      try {
        removedIndices = typeof req.body.removedProfileImages === 'string'
          ? JSON.parse(req.body.removedProfileImages)
          : req.body.removedProfileImages;
      } catch (e) {
        console.error('Error parsing removedProfileImages:', e);
      }
    }
    
    let remainingProfileImagesData = currentProfileImagesData.filter((_: any, index: number) => 
      !removedIndices.includes(index)
    );
    let remainingProfileImages = currentProfileImages.filter((_: any, index: number) => 
      !removedIndices.includes(index)
    );
    
    let profileFiles: any[] = [];
    if (files) {
      if (Array.isArray(files)) {
        profileFiles = files.filter((f: any) => f.fieldname === 'profileImages');
      } else if (files.profileImages && Array.isArray(files.profileImages)) {
        profileFiles = files.profileImages;
      }
    }
    
    if (profileFiles.length > 0) {
      const newProfileImagesData = profileFiles.map((f: any) => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileName: f.originalname,
      }));
      const newProfileImageUrls = profileFiles.map((f: any) => 
        `/uploads/settings/profile-${Date.now()}-${f.originalname}`
      );
      remainingProfileImagesData = [...remainingProfileImagesData, ...newProfileImagesData];
      remainingProfileImages = [...remainingProfileImages, ...newProfileImageUrls];
    }
    
    if (updateData.hero || profileFiles.length > 0 || removedIndices.length > 0) {
      updateData.hero = {
        ...(settings.hero || {}),
        ...(updateData.hero || {}),
        profileImagesData: remainingProfileImagesData,
        profileImages: remainingProfileImages,
      };
    }

    // 5. Merge with existing settings
    const settingsObj = typeof settings.toObject === 'function' ? settings.toObject() : settings;
    const merged = {
      ...settingsObj,
      ...updateData,
    };

    if (updateData.company) merged.company = { ...settingsObj.company, ...updateData.company };
    if (updateData.hero) merged.hero = { ...settingsObj.hero, ...updateData.hero };
    if (updateData.about) merged.about = { ...settingsObj.about, ...updateData.about };
    if (updateData.solutionsSection) merged.solutionsSection = { ...settingsObj.solutionsSection, ...updateData.solutionsSection };
    if (updateData.partnersSection) merged.partnersSection = { ...settingsObj.partnersSection, ...updateData.partnersSection };
    if (updateData.whyChooseUs) merged.whyChooseUs = { ...settingsObj.whyChooseUs, ...updateData.whyChooseUs };
    if (updateData.contact) merged.contact = { ...settingsObj.contact, ...updateData.contact };
    if (updateData.stats) merged.stats = { ...settingsObj.stats, ...updateData.stats };
    if (updateData.seo) merged.seo = { ...settingsObj.seo, ...updateData.seo };

    Object.assign(settings, merged);
    await settings.save();
    
    const updatedSettings = await SiteSettings.findById(settings._id);
    successResponse(res, updatedSettings, 'Settings updated successfully');
  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    errorResponse(res, error.message || 'Failed to update settings');
  }
};
