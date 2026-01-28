import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  college?: string;
  yearOfGraduation?: number;
  branch?: string;
  bio?: string;
  profilePicture?: string;
  subscriptionTier: 'free' | 'premium';
  dailyUsage: {
    date: string; // Format: YYYY-MM-DD
    counts: {
      resume: number;
      dsa: number;
      research: number;
      interview: number;
      roadmap: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  socialProfiles: {
    github?: { username: string; accessToken?: string; synced: boolean };
    linkedin?: { profileId: string; accessToken?: string; synced: boolean };
    codeforces?: { handle: string; rating: number; synced: boolean };
    leetcode?: { username: string; rating: number; synced: boolean };
  };
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  name: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  college: String,
  yearOfGraduation: Number,
  branch: String,
  bio: String,
  profilePicture: String,
  subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  dailyUsage: {
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    counts: {
      resume: { type: Number, default: 0 },
      dsa: { type: Number, default: 0 },
      research: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
      roadmap: { type: Number, default: 0 },
    }
  },
  socialProfiles: {
    github: {
      username: String,
      accessToken: String,
      synced: { type: Boolean, default: false }
    },
    linkedin: {
      profileId: String,
      accessToken: String,
      synced: { type: Boolean, default: false }
    },
    codeforces: {
      handle: String,
      rating: { type: Number, default: 0 },
      synced: { type: Boolean, default: false }
    },
    leetcode: {
      username: String,
      rating: { type: Number, default: 0 },
      synced: { type: Boolean, default: false }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
