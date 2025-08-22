import { PaginationParams } from './common.types.js';

export type StateFilters = PaginationParams & {
  search?: string;
};
