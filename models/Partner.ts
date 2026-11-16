import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  domain: string;
  description?: string;
  logo?: string;
  logoData?: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  website?: string;
  tier?: string;
  order: number;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    logoData: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    website: { type: String, default: '', trim: true },
    tier: { type: String, default: 'Global Technology Partner', trim: true },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PartnerSchema.index({ order: 1, featured: 1 });

export default mongoose.model<IPartner>('Partner', PartnerSchema);
