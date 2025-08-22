import Hapi from '@hapi/hapi';
import { quotationService } from '../services/quotation.service.js';
import {
  createQuotationRequestSchema,
  quotationFiltersSchema,
} from '../schemas/quotation.schema.js';
import { createValidationMiddleware } from '../plugins/validation.js';
import { CreateQuotationData, QuotationFilters } from '../types/quotation.types.js';

export const quotationRoutes = [
  {
    method: 'POST' as const,
    path: '/quotations',
    options: {
      pre: [
        {
          method: createValidationMiddleware({ payload: createQuotationRequestSchema }),
          assign: 'validation',
        },
      ],
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const { userId } = req.auth.credentials as { userId: string };
      const data = req.payload as CreateQuotationData;

      try {
        const quotation = await quotationService.createQuotation(data, userId);
        return h.response(quotation).code(201);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create quotation';
        return h.response({ message }).code(400);
      }
    },
  },

  {
    method: 'GET' as const,
    path: '/quotations',
    options: {
      auth: {
        scope: ['ADMIN'],
      },
      pre: [
        {
          method: createValidationMiddleware({ query: quotationFiltersSchema }),
          assign: 'validation',
        },
      ],
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const filters = req.query as QuotationFilters;
      const result = await quotationService.getAllQuotations(filters);
      return result;
    },
  },

  {
    method: 'GET' as const,
    path: '/quotation-requests/{id}',

    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const { id } = req.params as { id: string };
      const quotationId = parseInt(id, 10);

      if (isNaN(quotationId)) {
        return h.response({ message: 'Invalid quotation ID' }).code(400);
      }

      const quotation = await quotationService.getQuotationById(quotationId);
      if (!quotation) {
        return h.response({ message: 'Quotation not found' }).code(404);
      }

      return quotation;
    },
  },
];
