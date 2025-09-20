import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '7d';

export function signJwt(payload: object, expiresIn: string = DEFAULT_EXPIRY): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(payload, secret, { expiresIn });
}



