import jwt from 'jsonwebtoken';

const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  username: string;
}

export function signToken(payload: JwtPayload, secret: string = DEFAULT_JWT_SECRET): string {
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string, secret: string = DEFAULT_JWT_SECRET): JwtPayload {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}
