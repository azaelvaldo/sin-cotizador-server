import { PrismaClient } from '@prisma/client';
import { validateGeofence } from '../lib/geofence.js';
import {
  QuotationWithRelations,
  CreateQuotationData,
  QuotationFilters,
} from '../types/quotation.types.js';
import { PaginatedResponse } from '../types/common.types.js';

const prisma = new PrismaClient();

export class QuotationService {
  async createQuotation(
    data: CreateQuotationData,
    userId: string
  ): Promise<QuotationWithRelations> {
    try {
      // Validate geofence
      const geofenceValidation = validateGeofence(data.geofence);
      if (!geofenceValidation.isValid) {
        throw new Error(`Geofence validation failed: ${geofenceValidation.errors.join(', ')}`);
      }

      // Validate business rules
      this.validateBusinessRules(data);

      // Calculate insured area from geofence
      const insuredArea = geofenceValidation.calculatedArea!;

      const quotation = await prisma.quotation.create({
        data: {
          clientName: data.clientName,
          cropId: data.cropId,
          stateId: data.stateId,
          insuredArea,
          insuredAmount: data.insuredAmount,
          validityStart: data.validityStart,
          validityEnd: data.validityEnd,
          geofence: data.geofence as any, // Cast to any for Prisma Json field
          createdBy: userId,
        },
        include: {
          crop: {
            select: {
              id: true,
              name: true,
            },
          },
          state: {
            select: {
              id: true,
              name: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return quotation as QuotationWithRelations;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  async getQuotationById(id: string): Promise<QuotationWithRelations | null> {
    try {
      const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: {
          crop: {
            select: {
              id: true,
              name: true,
            },
          },
          state: {
            select: {
              id: true,
              name: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return quotation as QuotationWithRelations | null;
    } catch (error) {
      console.error('Error getting quotation by ID:', error);
      return null;
    }
  }

  async getAllQuotations(
    filters: QuotationFilters
  ): Promise<PaginatedResponse<QuotationWithRelations>> {
    try {
      // Ensure filters has default values if properties are missing
      const {
        search,
        page = 0,
        pageSize = 10,
        sortDirection = 'asc',
        sortKey = 'createdAt',
        cropId,
        stateId,
        createdBy,
        status,
        dateRange,
      } = filters || {};

      const where: any = {}

      if (search) {
        where.clientName = {
          contains: search,
          mode: 'insensitive' as const,
        };
      }

      if (cropId) {
        where.cropId = cropId;
      }

      if (stateId) {
        where.stateId = stateId;
      }

      if (createdBy) {
        where.createdBy = createdBy;
      }

      if (status) {
        where.status = status;
      }

      if (dateRange?.start || dateRange?.end) {
        where.createdAt = {};
        if (dateRange.start) {
          where.createdAt.gte = dateRange.start;
        }
        if (dateRange.end) {
          where.createdAt.lte = dateRange.end;
        }
      }

      console.log('Final where clause:', where);

      const [quotations, total] = await Promise.all([
        prisma.quotation.findMany({
          where,
          take: pageSize,
          skip: page * pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            crop: {
              select: {
                id: true,
                name: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
              },
            },
            createdByUser: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        }),
        prisma.quotation.count({ where }),
      ]);

      const hasMore = page * pageSize < total;

      return {
        data: quotations as QuotationWithRelations[],
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error('Error getting all quotations:', error);
      throw new Error('Failed to get quotations');
    }
  }

  private validateBusinessRules(data: CreateQuotationData): void {
    const errors: string[] = [];

    // Validate dates
    if (new Date(data.validityStart) >= new Date(data.validityEnd)) {
      errors.push('Validity start date must be before validity end date');
    }

    // Validate amounts
    if (data.insuredAmount <= 0) {
      errors.push('Insured amount must be positive');
    }

    // Validate client name
    if (!data.clientName || data.clientName.trim().length < 2) {
      errors.push('Client name must be at least 2 characters long');
    }

    if (errors.length > 0) {
      throw new Error(`Business validation failed: ${errors.join(', ')}`);
    }
  }
}

export const quotationService = new QuotationService();
