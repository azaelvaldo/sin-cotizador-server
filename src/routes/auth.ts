import Hapi from '@hapi/hapi';
import { authService } from '../services/auth.service.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { createValidationMiddleware } from '../plugins/validation.js';
import { LoginCredentials } from '../types/auth.types.js';

export const authRoutes = [
  {
    method: 'POST' as const,
    path: '/auth/login',
    options: {
      auth: false, // Public route
      pre: [
        {
          method: createValidationMiddleware({ payload: loginSchema }),
          assign: 'validation',
        },
      ],
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const credentials = req.payload as LoginCredentials;

      // Authenticate user using auth service
      const authResult = await authService.authenticateUser(credentials);

      if (!authResult.success || !authResult.user) {
        return h.response({ message: authResult.error || 'Invalid credentials' }).code(401);
      }

      // Generate JWT token
      const token = authService.generateToken(authResult.user);

      // Persist auth session cookie using @hapi/cookie (stores encrypted JWT)
      // The cookie strategy is named "session" and expects an object. We save the token.
      // This works even when auth is disabled for this route.
      (req as any).cookieAuth?.set?.({ token });

      const response = h.response({
        access_token: token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN,
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          role: authResult.user.role,
        },
      });

      return response;
    },
  },
  {
    method: 'POST' as const,
    path: '/auth/logout',
    options: {
      auth: false, // Public route
    },
    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const response = h.response({ message: 'Logged out successfully' });

      // Clear the authentication cookie/session
      (req as any).cookieAuth?.clear?.();

      return response;
    },
  },
];
