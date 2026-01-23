import mongoose, { Schema, Document } from 'mongoose';

interface IRoadmapMilestone {
  week: number;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
}

interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'sde' | 'aiml-engineer' | 'researcher' | 'data-scientist';
  duration: 3 | 6 | 12;
  milestones: IRoadmapMilestone[];
  progress: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapMilestoneSchema = new Schema<IRoadmapMilestone>({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  resources: [String],
  completed: { type: Boolean, default: false }
});

const RoadmapSchema = new Schema<IRoadmap>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['sde', 'aiml-engineer', 'researcher', 'data-scientist'], required: true },
  duration: { type: Number, enum: [3, 6, 12], required: true },
  milestones: [RoadmapMilestoneSchema],
  progress: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

RoadmapSchema.index({ userId: 1, role: 1 });

export default mongoose.model('Roadmap', RoadmapSchema);
