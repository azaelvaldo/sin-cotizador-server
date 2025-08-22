import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

export const userService = new UserService();
