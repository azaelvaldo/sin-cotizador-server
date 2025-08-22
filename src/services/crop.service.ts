import { PrismaClient, Crop } from '@prisma/client';
import { PaginatedResponse } from '../types/common.types.js';
import { CropFilters } from '../types/crop.types.js';

const prisma = new PrismaClient();

export class CropService {
  async getAllCrops(filters: CropFilters): Promise<PaginatedResponse<Crop>> {
    try {
      // Ensure filters has default values if properties are missing
      const { 
        search, 
        page = 0, 
        pageSize = 10, 
        sortDirection = 'asc', 
        sortKey = 'name' 
      } = filters || {};

      const where = search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {};

      const [crops, total] = await Promise.all([
        prisma.crop.findMany({
          where,
          take: pageSize,
          skip: page * pageSize,
          orderBy: { [sortKey]: sortDirection as 'asc' | 'desc' },
          select: {
            id: true,
            name: true,
          },
        } as any),
        prisma.crop.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        data: crops,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error getting crops:', error);
      throw new Error('Failed to get crops');
    }
  }
}

export const cropService = new CropService();
