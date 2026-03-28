import type {
  McpServerWithOwner,
  SubscriptionWithServer,
  ReviewWithUser,
  ApiKeyPublic,
} from "./index";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type ServersListResponse = PaginatedResponse<McpServerWithOwner>;
export type SubscriptionsListResponse = {
  subscriptions: SubscriptionWithServer[];
};
export type ReviewsListResponse = { reviews: ReviewWithUser[] };
export type ApiKeysListResponse = { keys: ApiKeyPublic[] };

export type CheckoutResponse = { checkoutUrl: string };
export type PortalResponse = { portalUrl: string };
export type ConnectOnboardResponse = { onboardingUrl: string };
export type ConnectStatusResponse = { onboarded: boolean; accountId?: string };

export type VerifyKeyResponse = {
  valid: boolean;
  userId?: string;
  serverId?: string;
  permissions?: string[];
};

export type ConfigSnippetResponse = {
  config: {
    mcpServers: Record<
      string,
      {
        url: string;
        headers: { Authorization: string };
      }
    >;
  };
};

export type CreateApiKeyResponse = {
  apiKey: ApiKeyPublic & { key: string };
};
