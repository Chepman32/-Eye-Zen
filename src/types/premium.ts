export type PremiumPlan = 'free' | 'lifetime' | 'yearly';

export const PREMIUM_PLAN_LIMITS: Record<PremiumPlan, number> = {
  free: 1,
  lifetime: 5,
  yearly: Infinity,
};

export const isUnlimitedPlan = (plan: PremiumPlan): boolean => plan === 'yearly';
