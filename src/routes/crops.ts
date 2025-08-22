import Hapi from '@hapi/hapi';
import { cropService } from '../services/crop.service.js';
import { cropFiltersSchema } from '../schemas/crop.schema.js';
import { createValidationMiddleware } from '../plugins/validation.js';

export const cropRoutes = [
  {
    method: 'GET' as const,
    path: '/crops',
    options: {
      pre: [
        {
          method: createValidationMiddleware({ query: cropFiltersSchema }),
          assign: 'validation',
        },
      ],
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const filters = (req.app as any).validation?.query || {};
      const result = await cropService.getAllCrops(filters);
      return result;
    },
  },
];
