import { Request, Response } from 'express';
import House, { HouseStatus, ApprovalStatus } from '../models/House';
import mongoose from 'mongoose';

const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res: Response, message: string = 'Error', statusCode: number = 500) => {
  res.status(statusCode).json({ success: false, message });
};

export const getPublicHouses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string || '';
    const propertyType = req.query.propertyType as string || '';
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice = parseFloat(req.query.maxPrice as string) || 10000000;
    const minBedrooms = parseInt(req.query.minBedrooms as string) || 0;
    const minBathrooms = parseInt(req.query.minBathrooms as string) || 0;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string === 'asc' ? 1 : -1;
    const amenities = req.query.amenities ? (req.query.amenities as string).split(',') : [];

    const skip = (page - 1) * limit;

    const filter: any = {
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (propertyType) filter.propertyType = propertyType;
    if (minBedrooms > 0) filter['details.bedrooms'] = { $gte: minBedrooms };
    if (minBathrooms > 0) filter['details.bathrooms'] = { $gte: minBathrooms };
    if (amenities.length > 0) filter['details.amenities'] = { $all: amenities };
    
    filter['pricing.price'] = { $gte: minPrice, $lte: maxPrice };

    const sort: any = {};
    if (sortBy === 'price') {
      sort['pricing.price'] = sortOrder;
    } else {
      sort[sortBy] = sortOrder;
    }

    // Get houses WITHOUT image data for performance
    const houses = await House.find(filter)
      .select('-images.data -threeDModels.data')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalHouses = await House.countDocuments(filter);
    const totalPages = Math.ceil(totalHouses / limit);

    successResponse(res, {
      houses,
      pagination: {
        currentPage: page,
        totalPages,
        totalHouses,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Public houses retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching public houses:', error);
    errorResponse(res, error.message, 500);
  }
};

export const getPublicHouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid house ID', 400);
    }

    const house = await House.findOne({
      _id: id,
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    }).populate('agentId', 'name email profile.phone');

    if (!house) {
      return errorResponse(res, 'House not found or not available', 404);
    }

    const houseWithImages = {
      ...house.toObject(),
      images: house.images.map(img => ({
        contentType: img.contentType,
        fileName: img.fileName,
        isPrimary: img.isPrimary,
        data: img.data ? img.data.toString('base64') : null
      })),
      threeDModels: house.threeDModels.map(model => {
        // Properly convert binary data to base64
        let base64Data = null;
        if (model.data) {
          if (Buffer.isBuffer(model.data)) {
            base64Data = model.data.toString('base64');
          } else if (typeof model.data === 'object' && model.data !== null) {
            const dataObj = model.data as any;
            if (dataObj.$binary && dataObj.$binary.base64) {
              base64Data = dataObj.$binary.base64;
            } else if (dataObj.data && Array.isArray(dataObj.data)) {
              base64Data = Buffer.from(dataObj.data).toString('base64');
            }
          }
        }
        return {
          contentType: model.contentType,
          fileName: model.fileName,
          isDefault: model.isDefault,
          data: base64Data
        };
      })
    };

    successResponse(res, houseWithImages, 'House retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching public house:', error);
    errorResponse(res, error.message, 500);
  }
};

export const getHousesForMap = async (req: Request, res: Response) => {
  try {
    const { bounds } = req.query;
    let filter: any = {
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    };

    if (bounds) {
      const { ne, sw } = JSON.parse(bounds as string);
      filter['location.coordinates'] = {
        $geoWithin: {
          $box: [
            [sw.lng, sw.lat],
            [ne.lng, ne.lat]
          ]
        }
      };
    }

    const houses = await House.find(filter)
      .select('title propertyType pricing.price location.coordinates location.city location.state details.bedrooms details.bathrooms details.area');

    const housesWithMapData = houses.map(house => ({
      _id: house._id,
      title: house.title,
      propertyType: house.propertyType,
      price: house.pricing.price,
      location: {
        city: house.location.city,
        state: house.location.state,
        coordinates: house.location.coordinates
      },
      details: {
        bedrooms: house.details.bedrooms,
        bathrooms: house.details.bathrooms,
        area: house.details.area
      }
    }));

    successResponse(res, housesWithMapData, 'Map houses retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching map houses:', error);
    errorResponse(res, error.message, 500);
  }
};

export const getPublicFilterOptions = async (req: Request, res: Response) => {
  try {
    const propertyTypes = await House.distinct('propertyType', {
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    });

    const amenities = await House.distinct('details.amenities', {
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    });

    const features = await House.distinct('details.features', {
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    });

    const priceRange = await House.aggregate([
      { $match: { status: HouseStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.price' },
          maxPrice: { $max: '$pricing.price' }
        }
      }
    ]);

    const bedroomOptions = await House.aggregate([
      { $match: { status: HouseStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED } },
      { $group: { _id: '$details.bedrooms', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const bathroomOptions = await House.aggregate([
      { $match: { status: HouseStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED } },
      { $group: { _id: '$details.bathrooms', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    successResponse(res, {
      propertyTypes: propertyTypes.filter(Boolean).sort(),
      amenities: amenities.filter(Boolean).sort(),
      features: features.filter(Boolean).sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000000 },
      bedroomOptions: bedroomOptions.filter(b => b._id !== null),
      bathroomOptions: bathroomOptions.filter(b => b._id !== null)
    }, 'Public filter options retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching public filter options:', error);
    errorResponse(res, error.message, 500);
  }
};

export const getThreeDModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modelIndex = parseInt(req.query.index as string) || 0;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid house ID', 400);
    }

    const house = await House.findOne({
      _id: id,
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    });

    if (!house || !house.threeDModels || house.threeDModels.length === 0) {
      return errorResponse(res, '3D model not found', 404);
    }

    const model = house.threeDModels[modelIndex];
    
    res.set('Content-Type', model.contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(model.data);
  } catch (error: any) {
    console.error('Error serving 3D model:', error);
    errorResponse(res, 'Internal server error', 500);
  }
};

export const getHouseImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const imageIndex = parseInt(req.query.index as string) || 0;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid house ID', 400);
    }

    const house = await House.findOne({
      _id: id,
      status: HouseStatus.AVAILABLE,
      approvalStatus: ApprovalStatus.APPROVED
    });

    if (!house || !house.images || house.images.length === 0) {
      return errorResponse(res, 'Image not found', 404);
    }

    const image = house.images[imageIndex];
    
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(image.data);
  } catch (error: any) {
    console.error('Error serving house image:', error);
    errorResponse(res, 'Internal server error', 500);
  }
};