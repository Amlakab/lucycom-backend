import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience extends Document {
  role: string;
  company: string;
  period: string;
  description: string;
  location?: string;
  companyLogo?: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    period: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    companyLogo: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IExperience>('Experience', ExperienceSchema);