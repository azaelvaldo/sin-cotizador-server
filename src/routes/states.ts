import Hapi from '@hapi/hapi';
import { stateService } from '../services/state.service.js';
import { stateFiltersSchema } from '../schemas/state.schema.js';
import { createValidationMiddleware } from '../plugins/validation.js';

export const stateRoutes = [
  {
    method: 'GET' as const,
    path: '/states',
    options: {
      pre: [
        {
          method: createValidationMiddleware({ query: stateFiltersSchema }),
          assign: 'validation',
        },
      ],
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const filters = (req.app as any).validation?.query || {};
      const result = await stateService.getAllStates(filters);
      return result;
    },
  },
];
