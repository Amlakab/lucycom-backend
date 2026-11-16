import mongoose, { Document, Schema } from 'mongoose';

export interface ISolution extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
  keyTechnologies: string[];
  deliverables?: string;
  image?: string;
  imageData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  order: number;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const SolutionSchema = new Schema<ISolution>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Radio', trim: true },
    features: [{ type: String, trim: true }],
    keyTechnologies: [{ type: String, trim: true }],
    deliverables: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    imageData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SolutionSchema.index({ order: 1, featured: 1 });

export default mongoose.model<ISolution>('Solution', SolutionSchema);
