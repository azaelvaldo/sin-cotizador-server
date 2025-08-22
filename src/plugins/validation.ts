import Hapi from '@hapi/hapi';
import { z, ZodSchema } from 'zod';

export interface ValidationOptions {
  payload?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Hapi plugin for Zod validation
 */
export const validationPlugin: Hapi.Plugin<void> = {
  name: 'validation',
  register: async (server: Hapi.Server) => {
    // Add validation method to server
    server.method('validate', validateWithZod);
  },
};

/**
 * Validate request data using Zod schemas
 */
export function validateWithZod<T = any>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errors: ValidationError[] = zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'Validation failed',
          code: 'unknown_error',
        },
      ],
    };
  }
}

/**
 * Middleware function to validate request data
 */
export function createValidationMiddleware(validationOptions: ValidationOptions) {
  return async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const errors: ValidationError[] = [];
    const validatedData: any = {};

    // Validate payload
    if (validationOptions.payload && request.payload) {
      const payloadValidation = validateWithZod(
        validationOptions.payload,
        validationOptions.payload,
        'payload'
      );
      if (!payloadValidation.success) {
        errors.push(...payloadValidation.errors);
      } else {
        validatedData.payload = payloadValidation.data;
      }
    }

    // Validate query parameters
    if (validationOptions.query) {
      // Always validate query, even if empty
      const queryData = request.query || {};
      const queryValidation = validateWithZod(validationOptions.query, queryData, 'query');
      
      if (!queryValidation.success) {
        errors.push(...queryValidation.errors);
      } else {
        validatedData.query = queryValidation.data;
      }
    }

    // Validate path parameters
    if (validationOptions.params && request.params) {
      const paramsValidation = validateWithZod(validationOptions.params, request.params, 'params');
      if (!paramsValidation.success) {
        errors.push(...paramsValidation.errors);
      } else {
        validatedData.params = paramsValidation.data;
      }
    }
    // If there are validation errors, return error response
    if (errors.length > 0) {
      return h
        .response({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          attributes: {
            errors,
          },
        })
        .code(400);
    }

    (request.app as any).validation = validatedData;    
    return h.continue;
  };
}

/**
 * Helper function to create route validation options
 */
export function validateRoute(validationOptions: ValidationOptions) {
  return {
    pre: [
      {
        method: createValidationMiddleware(validationOptions),
        assign: 'validation',
      },
    ],
  };
}
