import { Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AuthRequest } from './auth.js';
import { PLAN_LIMITS, FeatureType } from '../config/planLimits.js';

export const checkUsageLimit = (feature: FeatureType) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required for usage tracking.'
                });
            }

            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const today = new Date().toISOString().split('T')[0];
            const tier = user.subscriptionTier || 'free';
            const limit = PLAN_LIMITS[tier][feature];

            // Reset usage if it's a new day
            if (user.dailyUsage.date !== today) {
                user.dailyUsage = {
                    date: today,
                    counts: {
                        resume: 0,
                        dsa: 0,
                        research: 0,
                        interview: 0,
                        roadmap: 0,
                    }
                };
            }

            // Check if limit exceeded
            const currentUsage = (user.dailyUsage.counts as any)[feature] || 0;

            if (currentUsage >= limit) {
                return res.status(403).json({
                    success: false,
                    error: 'LIMIT_EXCEEDED',
                    message: `Daily limit reached for ${feature}. Please upgrade to Premium for unlimited access!`,
                    limitReached: true,
                    feature: feature,
                    tier: tier
                });
            }

            // Increment usage count and save
            (user.dailyUsage.counts as any)[feature] = currentUsage + 1;

            // Mark as modified if using nested objects in Mongoose
            user.markModified('dailyUsage.counts');
            await user.save();

            next();
        } catch (error) {
            console.error('Usage Guard Error:', error);
            next(error);
        }
    };
};
