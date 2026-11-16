import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import { successResponse, errorResponse, paginate } from '../utils/response';

// ========== PUBLIC ==========
export const getPublicBlogPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const filter = { published: true };
    const result = await paginate(BlogPost, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { publishedAt: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const getPublicBlogPost = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      published: true,
    });
    if (!post) return errorResponse(res, 'Blog post not found', 404);
    // Increment views
    post.views += 1;
    await post.save();
    successResponse(res, post);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

// ========== ADMIN ==========
export const getAllBlogPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, published } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    if (published !== undefined) filter.published = published === 'true';

    const result = await paginate(BlogPost, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { publishedAt: -1, created_at: -1 },
    });
    successResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, category, tags, published } = req.body;
    let image = '';
    let imageData = undefined;

    if (req.file) {
      imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      image = `/uploads/blog/${Date.now()}-${req.file.originalname}`;
    }

    const isPublished = published === 'true';
    const post = new BlogPost({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt,
      content,
      image,
      imageData,
      category,
      tags: tags ? JSON.parse(tags) : [],
      published: isPublished,
      publishedAt: isPublished ? new Date() : undefined, // ✅ Now allowed
    });

    await post.save();
    successResponse(res, post, 'Blog post created', 201);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return errorResponse(res, 'Blog post not found', 404);

    const updateData: any = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.imageData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
      };
      updateData.image = `/uploads/blog/${Date.now()}-${req.file.originalname}`;
    }

    // Parse tags if sent as string
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    // Handle publishing status
    if (updateData.published !== undefined) {
      const isPublished = updateData.published === 'true' || updateData.published === true;
      updateData.published = isPublished;
      
      // If published and was previously unpublished → set publishedAt
      if (isPublished && !post.published) {
        updateData.publishedAt = new Date();
      }
      // If unpublished → remove publishedAt
      if (!isPublished) {
        updateData.publishedAt = undefined; // ✅ Now allowed
      }
    }

    const updated = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    successResponse(res, updated, 'Blog post updated');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const deleteBlogPost = async (req: Request, res: Response) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) return errorResponse(res, 'Blog post not found', 404);
    successResponse(res, null, 'Blog post deleted');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return errorResponse(res, 'Blog post not found', 404);
    
    post.published = !post.published;
    post.publishedAt = post.published ? new Date() : undefined; // ✅ Now allowed
    
    await post.save();
    successResponse(res, post, `Published ${post.published ? 'enabled' : 'disabled'}`);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
};