import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
