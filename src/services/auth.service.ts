import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/hash.js';
import Jwt from '@hapi/jwt';
import { LoginCredentials, AuthResult, UserAuth, JwtPayload } from '../types/auth.types.js';

const prisma = new PrismaClient();

export class AuthService {
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: { password: true },
      });

      if (!user || !user.password) {
        return { success: false, error: 'Credenciales incorrectas' };
      }

      const isValidPassword = await verifyPassword(credentials.password, user.password.password);
      if (!isValidPassword) {
        return { success: false, error: 'Credenciales incorrectas' };
      }

      const userAuth: UserAuth = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return { success: true, user: userAuth };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  generateToken(user: UserAuth): string {
    const payload: JwtPayload = {
      aud: process.env.JWT_AUDIENCE!,
      iss: process.env.JWT_ISSUER!,
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return Jwt.token.generate(
      payload,
      {
        key: process.env.JWT_SECRET!,
        algorithm: 'HS256',
      },
      {
        ttlSec: 24 * 60 * 60, // 24 hours
      }
    );
  }
}

export const authService = new AuthService();
