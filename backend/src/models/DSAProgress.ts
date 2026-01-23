import mongoose, { Schema, Document } from 'mongoose';

interface IApproach {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  language: string;
  timestamp: Date;
}

interface IDSAProgress extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: string;
  sheetName: 'love-babbar' | 'striver-a2z' | 'blind-75' | 'neetcode-150' | 'striver-sde' | 'fraz';
  questionTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solved: boolean;
  approaches: IApproach[];
  aiFeedback?: string;
  lastModified: Date;
  createdAt: Date;
}

const DSAProgressSchema = new Schema<IDSAProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: String, required: true },
  sheetName: { type: String, enum: ['love-babbar', 'striver-a2z', 'blind-75', 'neetcode-150', 'striver-sde', 'fraz'], required: true },
  questionTitle: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  solved: { type: Boolean, default: false },
  approaches: [{
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    language: String,
    timestamp: { type: Date, default: Date.now }
  }],
  aiFeedback: String,
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

DSAProgressSchema.index({ userId: 1, sheetName: 1, questionId: 1 });

export default mongoose.model('DSAProgress', DSAProgressSchema);
