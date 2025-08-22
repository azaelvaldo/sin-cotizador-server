// Auth-related types

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResult = {
  success: boolean;
  user?: UserAuth;
  error?: string;
};

export type UserAuth = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

export type JwtPayload = {
  aud: string;
  iss: string;
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
};
