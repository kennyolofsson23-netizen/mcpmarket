import { z } from "zod";

const serverBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200),
  longDescription: z.string().optional(),
  category: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  pricingModel: z.enum(["FREE", "SUBSCRIPTION", "USAGE"]).default("FREE"),
  price: z.number().min(0).optional(),
  usagePrice: z.number().min(0).optional(),
  freeCallLimit: z.number().int().min(0).optional(),
  endpointUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  managedHosting: z.boolean().default(false),
  dockerImage: z.string().optional(),
  githubRepoUrl: z.string().url().optional().or(z.literal("")),
});

export const createServerSchema = serverBaseSchema.superRefine((data, ctx) => {
  if (
    data.pricingModel === "SUBSCRIPTION" &&
    (!data.price || data.price <= 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Price is required for subscription pricing",
      path: ["price"],
    });
  }
  if (data.pricingModel === "USAGE") {
    if (!data.usagePrice || data.usagePrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Usage price is required for usage-based pricing",
        path: ["usagePrice"],
      });
    }
    if (data.freeCallLimit === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Free call limit is required for usage-based pricing",
        path: ["freeCallLimit"],
      });
    }
  }
  if (!data.managedHosting && !data.endpointUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Endpoint URL is required unless using managed hosting",
      path: ["endpointUrl"],
    });
  }
});

export const updateServerSchema = serverBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (
      data.pricingModel === "SUBSCRIPTION" &&
      data.price !== undefined &&
      data.price <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for subscription pricing",
        path: ["price"],
      });
    }
    if (data.pricingModel === "USAGE") {
      if (data.usagePrice !== undefined && data.usagePrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Usage price is required for usage-based pricing",
          path: ["usagePrice"],
        });
      }
    }
  });

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
