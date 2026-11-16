import mongoose, { Document, Schema } from 'mongoose';

export enum ProjectCategory {
  TELECOM = 'telecom',
  DATACENTER = 'datacenter',
  EDUCATION = 'education',
  SECURITY = 'security',
  POWER = 'power',
  CONSULTANCY = 'consultancy',
  // Legacy compatibility fallbacks
  WEB = 'web',
  MOBILE = 'mobile',
  DESIGN = 'design',
  FULLSTACK = 'fullstack'
}

export interface IProject extends Document {
  title: string;
  description: string;
  image?: string;
  imageData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  tags: string[];
  github?: string;
  liveUrl?: string;
  category: ProjectCategory;
  featured: boolean;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    imageData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    tags: [{ type: String, trim: true }],
    github: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    category: {
      type: String,
      enum: Object.values(ProjectCategory),
      required: true,
      default: ProjectCategory.TELECOM,
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ProjectSchema.index({ category: 1, featured: 1, order: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
