import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  pricing: z.enum(['FREE', 'SUBSCRIPTION', 'USAGE', 'all']).optional(),
  sort: z.enum(['popular', 'newest', 'rating']).optional().default('popular'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idSchema = z.object({
  id: z.string().cuid(),
});

export const slugSchema = z.object({
  slug: z.string().min(1),
});

export const emailSchema = z.object({
  email: z.string().email(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
