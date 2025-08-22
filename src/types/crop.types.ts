// Crop-related types - leveraging Prisma types
import { PaginationParams } from './common.types.js';

// Filter types
export type CropFilters = PaginationParams & {
  search?: string;
};
