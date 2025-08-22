import { z } from 'zod';

// Common filter schema with search and pagination
export const baseQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});
