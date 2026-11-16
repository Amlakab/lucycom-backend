// models/Certification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICertification extends Document {
  title: string;
  organization?: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  image?: string;
  imageData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  category: 'Academic Credentials & Transcripts' | 
            'Technical & Skill-Based Certifications' | 
            'Extracurricular, Volunteer & Community Involvement' | 
            'Professional Development & Short Courses' | 
            'Honors, Awards & Recognition';
  credentialId?: string;
  credentialUrl?: string;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    image: { type: String, default: '' },
    imageData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    category: { 
      type: String, 
      required: true, 
      enum: [
        'Academic Credentials & Transcripts',
        'Technical & Skill-Based Certifications',
        'Extracurricular, Volunteer & Community Involvement',
        'Professional Development & Short Courses',
        'Honors, Awards & Recognition'
      ]
    },
    credentialId: { type: String, trim: true },
    credentialUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

CertificationSchema.index({ category: 1 });
CertificationSchema.index({ featured: 1 });
CertificationSchema.index({ startDate: -1 });

export default mongoose.model<ICertification>('Certification', CertificationSchema);