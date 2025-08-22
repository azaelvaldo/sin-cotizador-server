import Hapi from '@hapi/hapi';
import { userService } from '../services/user.service.js';

export const userRoutes = [
  {
    method: 'GET' as const,
    path: '/me',

    handler: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const { userId } = req.auth.credentials as { userId: string };
      const user = await userService.getUserById(userId);
      if (!user) {
        return h.response({ message: 'User not found' }).code(404);
      }
      return user;
    },
  },
];
