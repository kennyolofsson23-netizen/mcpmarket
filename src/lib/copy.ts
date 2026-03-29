/**
 * Centralised user-facing copy.
 *
 * Usage: import { COPY } from "@/lib/copy"
 * Then reference e.g. COPY.emptyStates.noSubscriptions
 *
 * Rules:
 *  - No lorem ipsum.
 *  - No "Click here" or "Welcome to…".
 *  - Error messages never expose stack traces, internal paths, or DB details.
 *  - Loading messages are context-aware — they say what is loading, not just "Loading…"
 */

export const COPY = {
  // ---------------------------------------------------------------------------
  // Empty states
  // Used with <EmptyState title= description= action= />
  // ---------------------------------------------------------------------------
  emptyStates: {
    noSearchResults: {
      title: "No servers match your filters",
      description:
        "Try a different category or remove the pricing filter to see more results.",
      action: { label: "Clear Filters" },
    },
    noSubscriptions: {
      title: "No active subscriptions",
      description:
        "Browse the marketplace to find MCP tools for your AI client.",
      action: { label: "Browse Servers", href: "/servers" },
    },
    noApiKeys: {
      title: "No API keys yet",
      description:
        "API keys are created automatically when you subscribe to a server.",
      action: { label: "Browse Servers", href: "/servers" },
    },
    noDeveloperServers: {
      title: "You haven't listed any servers yet",
      description:
        "List your first MCP server to start earning revenue. Setup takes under 30 minutes.",
      action: {
        label: "List Your First Server",
        href: "/dashboard/developer/servers/new",
      },
    },
    noPayouts: {
      title: "No payouts yet",
      description:
        "Payouts are processed on the 1st of each month once your balance reaches $25.",
    },
    noWebhooks: {
      title: "No webhooks configured",
      description:
        "Add a webhook endpoint to receive real-time events when users subscribe or cancel.",
      action: { label: "Add Webhook" },
    },
    noTeamMembers: {
      title: "Your team is empty",
      description:
        "Invite team members to share API key access across all subscribed servers.",
      action: { label: "Invite a Member" },
    },
    noAdminPendingServers: {
      title: "No servers pending review",
      description:
        "All submitted servers have been reviewed. New submissions will appear here.",
    },
    noAdminUserResults: {
      title: "No users found",
      description: "Try searching by a different email address or name.",
    },
    noReviews: {
      title: "No reviews yet",
      description:
        "Subscribers can leave a review after using this server. Be the first.",
    },
    noTransactions: {
      title: "No transactions yet",
      description:
        "Revenue from new subscriptions will appear here within a few minutes of payment.",
    },
  },

  // ---------------------------------------------------------------------------
  // Error messages
  // User-facing only — never expose internal details
  // ---------------------------------------------------------------------------
  errors: {
    generic: "Something went wrong. Refresh the page or try again in a moment.",
    notFound: "This page doesn't exist or has been removed.",
    unauthorized: "You don't have permission to view this.",
    sessionExpired: "Your session has expired. Sign in to continue.",
    serverNotFound: "This MCP server couldn't be found.",
    serverSuspended:
      "This server has been suspended and is not available for new subscriptions.",
    subscriptionFailed:
      "We couldn't complete your subscription. No charge was made — please try again.",
    checkoutFailed:
      "Checkout couldn't be started. Please try again or contact support if this keeps happening.",
    paymentRequired: "Subscribe to this server to access it.",
    keyRevoked:
      "This API key has been revoked. Generate a new key from your dashboard.",
    keyGenerateFailed:
      "Couldn't generate a new API key. Refresh the page and try again.",
    listingRejected:
      "Your server listing was not approved. Check the rejection reason in your developer dashboard.",
    uploadTooLarge: "File exceeds the 2 MB limit. Choose a smaller image.",
    uploadBadType: "Only PNG and JPG images are accepted.",
    formRequired: "Complete all required fields before submitting.",
    webhookBadUrl: "Enter a valid HTTPS URL for your webhook endpoint.",
    payoutBelowMinimum:
      "Payouts require a minimum balance of $25. Your current balance will carry over to next month.",
    connectNotSetUp:
      "Set up Stripe payouts from your developer dashboard before you can receive revenue.",
    reviewAlreadyExists:
      "You've already reviewed this server. Edit your existing review below.",
    reviewNoSubscription: "Subscribe to this server to leave a review.",
    cancelFailed:
      "Couldn't cancel the subscription. Refresh and try again, or contact support.",
    revokeFailed:
      "Couldn't revoke this key. Refresh the page and try revoking again.",
    adminApproveFailed: "Couldn't approve this server. Refresh and try again.",
    adminRejectFailed: "Couldn't reject this server. Refresh and try again.",
  },

  // ---------------------------------------------------------------------------
  // Auth-specific messages
  // ---------------------------------------------------------------------------
  auth: {
    signInPrompt: "Sign in to continue",
    signInWithGitHub: "Continue with GitHub",
    signInWithGoogle: "Continue with Google",
    signInSubtext:
      "By signing in you agree to our Terms of Service and Privacy Policy.",
    upgradeToDevTitle: "Become a Developer",
    upgradeToDevDescription:
      "List your MCP server on the marketplace, set your own price, and earn 80% of every subscription.",
    upgradeToDevCTA: "Upgrade to Developer Account",
    upgradeToDevTerms:
      "By upgrading you agree to the MCPmarket Developer Terms.",
    errorOAuthCallback:
      "Sign-in failed. Make sure you've authorized MCPmarket in your GitHub or Google account settings.",
    errorEmailExists:
      "An account with this email already exists. Sign in with the original provider.",
    errorSessionRequired: "Sign in to access your dashboard.",
  },

  // ---------------------------------------------------------------------------
  // Loading / async status messages
  // Context-aware — say what is loading, not just "Loading…"
  // ---------------------------------------------------------------------------
  loading: {
    servers: "Loading servers…",
    subscriptions: "Loading your subscriptions…",
    dashboard: "Loading your dashboard…",
    payouts: "Loading payout history…",
    analytics: "Loading analytics…",
    apiKeys: "Loading API keys…",
    teamMembers: "Loading team members…",
    webhooks: "Loading webhooks…",
    adminStats: "Loading platform stats…",
    saving: "Saving…",
    submitting: "Submitting…",
    publishing: "Publishing your server…",
    canceling: "Canceling subscription…",
    revoking: "Revoking key…",
    checkoutRedirect: "Redirecting to checkout…",
    portalRedirect: "Opening billing portal…",
    connectRedirect: "Redirecting to Stripe…",
  },

  // ---------------------------------------------------------------------------
  // Toast / success feedback
  // Short, past-tense confirmation of the action the user just took
  // ---------------------------------------------------------------------------
  success: {
    serverSubmitted:
      "Server listing submitted for review. Approval takes up to 24 hours.",
    serverUpdated: "Server listing updated.",
    subscriptionActive:
      "Subscription active. Your API key is ready — copy it now.",
    subscriptionCanceled:
      "Subscription canceled. Your access continues until the end of this billing period.",
    keyGenerated:
      "New API key generated. Copy it now — it won't be shown again.",
    keyRevoked: "API key revoked.",
    webhookSaved: "Webhook endpoint saved.",
    webhookDeleted: "Webhook removed.",
    reviewSubmitted: "Review submitted.",
    reviewUpdated: "Review updated.",
    teamInviteSent: "Invitation sent.",
    profileUpdated: "Profile updated.",
    serverApproved: "Server approved and now live on the marketplace.",
    serverRejected: "Server rejected. The developer has been notified.",
  },

  // ---------------------------------------------------------------------------
  // Form field labels and placeholders
  // Used in server listing form, review form, webhook settings
  // ---------------------------------------------------------------------------
  forms: {
    serverListing: {
      nameLabel: "Server name",
      namePlaceholder: "e.g. Code Review Pro",
      descriptionLabel: "Short description",
      descriptionPlaceholder:
        "One or two sentences describing what your server does",
      categoryLabel: "Category",
      categoryPlaceholder: "Select a category",
      pricingModelLabel: "Pricing model",
      pricingModelPlaceholder: "Select a pricing model",
      priceLabel: "Price",
      pricePlaceholder: "e.g. 12.00",
      freeCallsLabel: "Free tier calls",
      freeCallsPlaceholder: "e.g. 100",
      endpointLabel: "Server endpoint URL",
      endpointPlaceholder: "https://your-server.example.com",
      readmeLabel: "Documentation (Markdown)",
      readmePlaceholder:
        "Describe what your server does, available tools, and how to use them",
      logoLabel: "Server logo",
      logoHint: "PNG or JPG, max 2 MB",
      submitLabel: "Submit for Review",
      saveDraftLabel: "Save Draft",
    },
    review: {
      ratingLabel: "Your rating",
      commentLabel: "Your review",
      commentPlaceholder:
        "Describe your experience — what works well, what could be better",
      submitLabel: "Submit Review",
      updateLabel: "Update Review",
    },
    webhook: {
      urlLabel: "Endpoint URL",
      urlPlaceholder: "https://your-server.example.com/webhooks/mcpmarket",
      eventsLabel: "Events to receive",
      submitLabel: "Save Webhook",
    },
    search: {
      placeholder: "Search servers by name, description, or tag…",
      label: "Search MCP servers",
    },
    adminReject: {
      reasonLabel: "Rejection reason",
      reasonPlaceholder:
        "Explain clearly why the listing was rejected and what the developer needs to fix",
      submitLabel: "Reject Listing",
    },
  },

  // ---------------------------------------------------------------------------
  // Dashboard section headings and descriptions
  // ---------------------------------------------------------------------------
  dashboard: {
    userTitle: "Your Dashboard",
    userSubtitle: "Manage your subscriptions, API keys, and billing.",
    developerTitle: "Developer Dashboard",
    developerSubtitle:
      "Monitor revenue, subscribers, and usage across your listed servers.",
    adminTitle: "Admin Dashboard",
    adminSubtitle: "Review server submissions and manage platform users.",
    apiKeysTitle: "API Keys",
    apiKeysDescription:
      "API keys authenticate your requests to subscribed MCP servers. Each key is shown only once — store it securely.",
    subscriptionsTitle: "Your Subscriptions",
    subscriptionsDescription:
      "Active subscriptions give you API key access to the server. Canceled subscriptions stay active until the period ends.",
    payoutsTitle: "Payout History",
    payoutsDescription:
      "Payouts are sent on the 1st of each month via Stripe Connect. The $25 minimum balance rolls over if not met.",
    teamTitle: "Team Members",
    teamDescription:
      "Team members share access to all servers subscribed under this account.",
  },

  // ---------------------------------------------------------------------------
  // Config snippet modal
  // ---------------------------------------------------------------------------
  configSnippet: {
    title: "Your MCP Config",
    description:
      "Paste this into your claude_desktop_config.json or mcp.json file to connect this server to your AI client.",
    copyLabel: "Copy Config",
    copiedLabel: "Copied!",
    keyWarning:
      "Your API key is embedded in this snippet. Do not share it publicly.",
    regenerateLabel: "Regenerate Key",
    regenerateWarning:
      "Regenerating your key immediately revokes the old one. Any existing config using the old key will stop working.",
  },
} as const;

export type CopyKey = typeof COPY;
