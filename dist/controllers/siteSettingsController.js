"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettings = exports.getSiteSettings = exports.getPublicSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const response_1 = require("../utils/response");
const getPublicSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            settings = await SiteSettings_1.default.getSettings();
        }
        (0, response_1.successResponse)(res, settings);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getPublicSettings = getPublicSettings;
const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            settings = await SiteSettings_1.default.getSettings();
        }
        (0, response_1.successResponse)(res, settings);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message);
    }
};
exports.getSiteSettings = getSiteSettings;
const updateSiteSettings = async (req, res) => {
    try {
        console.log('🔵 Update Settings Request Received');
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            settings = await SiteSettings_1.default.getSettings();
        }
        if (!settings) {
            return (0, response_1.errorResponse)(res, 'Settings not found', 404);
        }
        const multerReq = req;
        const files = multerReq.files;
        const updateData = {};
        // Helper to safely parse JSON strings or objects
        const parseField = (fieldVal) => {
            if (!fieldVal)
                return null;
            if (typeof fieldVal === 'string') {
                try {
                    return JSON.parse(fieldVal);
                }
                catch {
                    return fieldVal;
                }
            }
            return fieldVal;
        };
        if (req.body.company)
            updateData.company = parseField(req.body.company);
        if (req.body.hero)
            updateData.hero = parseField(req.body.hero);
        if (req.body.about)
            updateData.about = parseField(req.body.about);
        if (req.body.solutionsSection)
            updateData.solutionsSection = parseField(req.body.solutionsSection);
        if (req.body.partnersSection)
            updateData.partnersSection = parseField(req.body.partnersSection);
        if (req.body.whyChooseUs)
            updateData.whyChooseUs = parseField(req.body.whyChooseUs);
        if (req.body.contact)
            updateData.contact = parseField(req.body.contact);
        if (req.body.stats)
            updateData.stats = parseField(req.body.stats);
        if (req.body.seo)
            updateData.seo = parseField(req.body.seo);
        // 2. Handle about image upload
        let aboutImageFile = null;
        if (files) {
            if (Array.isArray(files)) {
                aboutImageFile = files.find((f) => f.fieldname === 'aboutImage');
            }
            else if (files.aboutImage && files.aboutImage.length > 0) {
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
        let removedIndices = [];
        if (req.body.removedProfileImages) {
            try {
                removedIndices = typeof req.body.removedProfileImages === 'string'
                    ? JSON.parse(req.body.removedProfileImages)
                    : req.body.removedProfileImages;
            }
            catch (e) {
                console.error('Error parsing removedProfileImages:', e);
            }
        }
        let remainingProfileImagesData = currentProfileImagesData.filter((_, index) => !removedIndices.includes(index));
        let remainingProfileImages = currentProfileImages.filter((_, index) => !removedIndices.includes(index));
        let profileFiles = [];
        if (files) {
            if (Array.isArray(files)) {
                profileFiles = files.filter((f) => f.fieldname === 'profileImages');
            }
            else if (files.profileImages && Array.isArray(files.profileImages)) {
                profileFiles = files.profileImages;
            }
        }
        if (profileFiles.length > 0) {
            const newProfileImagesData = profileFiles.map((f) => ({
                data: f.buffer,
                contentType: f.mimetype,
                fileName: f.originalname,
            }));
            const newProfileImageUrls = profileFiles.map((f) => `/uploads/settings/profile-${Date.now()}-${f.originalname}`);
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
        if (updateData.company)
            merged.company = { ...settingsObj.company, ...updateData.company };
        if (updateData.hero)
            merged.hero = { ...settingsObj.hero, ...updateData.hero };
        if (updateData.about)
            merged.about = { ...settingsObj.about, ...updateData.about };
        if (updateData.solutionsSection)
            merged.solutionsSection = { ...settingsObj.solutionsSection, ...updateData.solutionsSection };
        if (updateData.partnersSection)
            merged.partnersSection = { ...settingsObj.partnersSection, ...updateData.partnersSection };
        if (updateData.whyChooseUs)
            merged.whyChooseUs = { ...settingsObj.whyChooseUs, ...updateData.whyChooseUs };
        if (updateData.contact)
            merged.contact = { ...settingsObj.contact, ...updateData.contact };
        if (updateData.stats)
            merged.stats = { ...settingsObj.stats, ...updateData.stats };
        if (updateData.seo)
            merged.seo = { ...settingsObj.seo, ...updateData.seo };
        Object.assign(settings, merged);
        await settings.save();
        const updatedSettings = await SiteSettings_1.default.findById(settings._id);
        (0, response_1.successResponse)(res, updatedSettings, 'Settings updated successfully');
    }
    catch (error) {
        console.error('❌ Error updating settings:', error);
        (0, response_1.errorResponse)(res, error.message || 'Failed to update settings');
    }
};
exports.updateSiteSettings = updateSiteSettings;
