import type {
  User,
  McpServer,
  Subscription,
  Review,
  ApiKey,
  Transaction,
  FeaturedListing,
  UsageRecord,
  DeveloperWebhook,
  WebhookLog,
  ServerVersion,
  Team,
  TeamMember,
} from "@prisma/client";

export type {
  User,
  McpServer,
  Subscription,
  Review,
  ApiKey,
  Transaction,
  FeaturedListing,
  UsageRecord,
  DeveloperWebhook,
  WebhookLog,
  ServerVersion,
  Team,
  TeamMember,
};

export type UserRole = "USER" | "DEVELOPER" | "ADMIN";
export type ServerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE";
export type PricingModel = "FREE" | "SUBSCRIPTION" | "USAGE";
export type TransactionStatus = "PENDING" | "COMPLETED" | "REFUNDED";

export type McpServerWithOwner = McpServer & {
  owner: Pick<User, "id" | "name" | "email" | "image">;
  _count?: { subscriptions: number; reviews: number };
};

export type McpServerWithStats = McpServerWithOwner & {
  userSubscription?: Subscription | null;
  reviewsPreview?: Review[];
};

export type SubscriptionWithServer = Subscription & {
  server: McpServer;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

export type ApiKeyPublic = Omit<ApiKey, "keyHash"> & {
  serverName?: string;
};

export type WebhookPublic = Omit<DeveloperWebhook, "secretHash">;

export type DeveloperStats = {
  totalSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalInstalls: number;
  servers: Array<{
    id: string;
    name: string;
    subscribers: number;
    revenue: number;
    status: string;
  }>;
  revenueChart: Array<{ month: string; revenue: number }>;
};

export type AdminStats = {
  pendingServers: number;
  totalUsers: number;
  totalRevenue: number;
  platformFeeEarned: number;
  totalServers: number;
  activeSubscriptions: number;
};
