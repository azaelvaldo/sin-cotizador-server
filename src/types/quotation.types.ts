// Quotation types - leveraging Prisma types

import { Quotation, Crop, State, User } from '@prisma/client';
import { PaginationParams } from './common.types.js';

// Use Prisma types directly
export type { Quotation, Crop, State, User };

// GeoJSON types for geofence
export type Coordinate = number[];

export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type GeoJSONMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: number[][][][];
};

export type Geofence = GeoJSONPolygon | GeoJSONMultiPolygon;

// Extended quotation types with relations
export type QuotationWithRelations = Quotation & {
  crop: Pick<Crop, 'id' | 'name'>;
  state: Pick<State, 'id' | 'name'>;
  createdByUser: Pick<User, 'id' | 'email' | 'role'>;
};

// Input types for quotation operations
export type CreateQuotationData = {
  clientName: string;
  cropId: number;
  stateId: number;
  insuredAmount: number;
  validityStart: Date;
  validityEnd: Date;
  geofence: Geofence;
};

// Filter types
export type QuotationFilters = PaginationParams & {
  search?: string;
  cropId?: number;
  stateId?: number;
  createdBy?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  insuredAmount?: number;
};
