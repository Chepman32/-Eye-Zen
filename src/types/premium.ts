export type PremiumPlan = 'free' | 'lifetime';

export const PREMIUM_PLAN_LIMITS: Record<PremiumPlan, number> = {
  free: 1,
  // Paying users get unlimited sessions
  lifetime: Infinity,
};

export const isUnlimitedPlan = (plan: PremiumPlan): boolean => plan === 'lifetime';
