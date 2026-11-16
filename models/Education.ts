import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  institution: string;
  year: string;
  description: string;
  logo?: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IEducation>('Education', EducationSchema);