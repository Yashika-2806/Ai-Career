import mongoose, { Schema, Document } from 'mongoose';

interface IResumeVersion extends Document {
  versionNumber: number;
  title: string;
  content: string;
  atsScore: number;
  generatedAt: Date;
}

interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  versions: IResumeVersion[];
  currentVersion: number;
  lastSyncedAt: Date;
  syncedSources: {
    github: boolean;
    linkedin: boolean;
    codeforces: boolean;
    leetcode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeVersionSchema = new Schema<IResumeVersion>({
  versionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  atsScore: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
});

const ResumeSchema = new Schema<IResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  versions: [ResumeVersionSchema],
  currentVersion: { type: Number, default: 1 },
  lastSyncedAt: Date,
  syncedSources: {
    github: { type: Boolean, default: false },
    linkedin: { type: Boolean, default: false },
    codeforces: { type: Boolean, default: false },
    leetcode: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', ResumeSchema);
