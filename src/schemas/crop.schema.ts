import { z } from 'zod';
import { baseQuerySchema } from './common.schema.js';

// Crop filters schema (extends base filter)
export const cropFiltersSchema = baseQuerySchema;

// Paginated crops response schema (extends base paginated response)
