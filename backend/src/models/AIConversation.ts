import mongoose, { Schema, Document } from 'mongoose';

interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;
  context: 'global' | 'dsa' | 'resume' | 'research' | 'interview' | 'roadmap';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  metadata: {
    currentPage?: string;
    relatedQuestion?: string;
    relatedProject?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  context: { type: String, enum: ['global', 'dsa', 'resume', 'research', 'interview', 'roadmap'], required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    currentPage: String,
    relatedQuestion: String,
    relatedProject: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AIConversationSchema.index({ userId: 1, context: 1 });

export default mongoose.model('AIConversation', AIConversationSchema);
