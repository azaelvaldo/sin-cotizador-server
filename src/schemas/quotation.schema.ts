import { z } from 'zod';
import { baseQuerySchema } from './common.schema.js';

// Geofence coordinate schema
const coordinateSchema = z.number().array().min(2).max(3);

// Polygon schema
const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinateSchema)).min(1),
});

// MultiPolygon schema
const multiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(coordinateSchema))).min(1),
});

// Geofence schema (GeoJSON Feature with Polygon or MultiPolygon geometry)
const geofenceSchema = z.object({
  type: z.literal('Feature'),
  properties: z.record(z.string(), z.any()).optional(),
  geometry: z.union([polygonSchema, multiPolygonSchema]),
});

// Create quotation schema
export const createQuotationRequestSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  cropId: z.number().int().positive('Invalid crop ID'),
  stateId: z.number().int().positive('Invalid state ID'),
  insuredAmount: z.number().positive('Insured amount must be positive'),
  validityStart: z.string().datetime('Invalid validity start date'),
  validityEnd: z.string().datetime('Invalid validity end date'),
  geofence: geofenceSchema,
});

const quotationSpecificFiltersSchema = z.object({
  cropId: z.coerce.number().int().positive('Invalid crop ID').optional(),
  stateId: z.coerce.number().int().positive('Invalid state ID').optional(),
  createdBy: z.string().uuid('Invalid user ID').optional(),
  status: z.string().optional(),
  dateRange: z
    .object({
      start: z.string().datetime('Invalid start date').optional(),
      end: z.string().datetime('Invalid end date').optional(),
    })
    .optional(),
  insuredAmount: z.coerce.number().positive('Insured amount must be positive').optional(),
});

export const quotationFiltersSchema = baseQuerySchema.and(quotationSpecificFiltersSchema);
