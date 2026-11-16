import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  avatarData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  rating: number;
  featured: boolean;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    avatarData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);