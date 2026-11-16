import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  imageData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  category: string;
  tags: string[];
  views: number;
  published: boolean;
  publishedAt?: Date; // ✅ Made optional
  created_at: Date;
  updated_at: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    imageData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    views: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null }, // Allow null/undefined
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ published: 1, publishedAt: -1 });

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);