import { PrismaClient, State } from '@prisma/client';

import { PaginatedResponse } from '../types/common.types.js';
import { StateFilters } from '../types/state.types.js';

const prisma = new PrismaClient();

export class StateService {
  async getAllStates(filters: StateFilters): Promise<PaginatedResponse<State>> {
    try {
      const { search, page = 0, pageSize = 10, sortDirection = 'asc', sortKey } = filters;

      const where = search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {};

      const [states, total] = await Promise.all([
        prisma.state.findMany({
          where,
          take: pageSize,
          skip: page * pageSize,
          orderBy: { [sortKey || 'name']: sortDirection as 'asc' | 'desc' },
          select: {
            id: true,
            name: true,
          },
        } as any),
        prisma.state.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        data: states,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error getting states:', error);
      throw new Error('Failed to get states');
    }
  }
}

export const stateService = new StateService();
