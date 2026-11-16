import mongoose, { Document, Schema } from 'mongoose';

export enum SkillCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DESIGN = 'design',
  TOOLS = 'tools',
}

export interface ISkill extends Document {
  name: string;
  value: number;
  category: SkillCategory;
  icon: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0, max: 100 },
    category: {
      type: String,
      enum: Object.values(SkillCategory),
      required: true,
    },
    icon: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

SkillSchema.index({ category: 1, order: 1 });

export default mongoose.model<ISkill>('Skill', SkillSchema);