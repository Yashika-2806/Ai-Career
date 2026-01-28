export const PLAN_LIMITS = {
    free: {
        resume: 2,
        dsa: 2,
        research: 2,
        interview: 2,
        roadmap: 2,
    },
    premium: {
        resume: 1000, // Effectively unlimited
        dsa: 1000,
        research: 1000,
        interview: 1000,
        roadmap: 1000,
    }
};

export type FeatureType = keyof typeof PLAN_LIMITS.free;
