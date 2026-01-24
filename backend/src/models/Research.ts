import mongoose, { Schema, Document } from 'mongoose';

interface IResearchProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  abstract: string;
  problemStatement: string;
  methodology: string;
  relatedWorks: string[];
  citationSuggestions: string[];
  status: 'draft' | 'in-progress' | 'completed' | 'submitted' | 'published';
  exportFormats: {
    ieee?: string;
    springer?: string;
    bibtex?: string;
  };
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchProjectSchema = new Schema<IResearchProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  abstract: { type: String, default: '' },
  problemStatement: { type: String, required: true },
  methodology: { type: String, default: '' },
  relatedWorks: { type: [String], default: [] },
  citationSuggestions: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'in-progress', 'completed', 'submitted', 'published'], default: 'draft' },
  exportFormats: {
    ieee: String,
    springer: String,
    bibtex: String
  },
  aiSummary: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResearchProjectSchema.index({ userId: 1 });

export default mongoose.model('ResearchProject', ResearchProjectSchema);
