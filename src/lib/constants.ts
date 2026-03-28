export const CATEGORIES = [
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps & Infrastructure' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'general', label: 'General' },
] as const;

export const PRICING_MODELS = [
  { value: 'FREE', label: 'Free' },
  { value: 'SUBSCRIPTION', label: 'Subscription ($/mo)' },
  { value: 'USAGE', label: 'Usage-Based ($/call)' },
] as const;

export const SERVER_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  DEVELOPER: 'DEVELOPER',
  ADMIN: 'ADMIN',
} as const;

export const PLATFORM_FEE_PERCENT = 20;
export const DEVELOPER_SHARE_PERCENT = 80;
export const MANAGED_HOSTING_PRICE_CENTS = 900;
export const FEATURED_LISTING_PRICE_CENTS = 2900;
export const MIN_PAYOUT_CENTS = 2500;

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
] as const;

export const WEBHOOK_EVENTS = [
  'subscription.created',
  'subscription.canceled',
  'subscription.payment_failed',
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];
export type PricingModel = (typeof PRICING_MODELS)[number]['value'];
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
