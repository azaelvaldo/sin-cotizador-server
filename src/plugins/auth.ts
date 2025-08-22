import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function registerAuth(server: Hapi.Server) {
  await server.register([Jwt]);

  // Shared validation function for both strategies
  const validateToken = async (artifacts: any) => {
    const { sub, role } = artifacts.decoded.payload as { sub: string; role: string };

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) return { isValid: false };

    return {
      isValid: true,
      credentials: {
        userId: user.id,
        role: user.role,
        scope: [user.role],
      },
    };
  };

  // Removed cookie-based auth; we will only accept Authorization header Bearer tokens

  // JWT strategy for Authorization header
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: process.env.JWT_AUDIENCE,
      iss: process.env.JWT_ISSUER,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: validateToken,
  });

  // Default to header-based JWT only
  server.auth.default({ strategies: ['jwt'], mode: 'required' });
}
